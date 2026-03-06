package com.example.backendservice.features.ai.service;

import com.example.backendservice.features.ai.dto.AiClassificationResponse;
import com.example.backendservice.features.settings.service.SystemSettingService;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiClassificationServiceImpl implements AiClassificationService {

    private final RestTemplate restTemplate;
    private final WasteTypeRepository wasteTypeRepository;
    private final SystemSettingService systemSettingService;
    private final ObjectMapper objectMapper;

    @Value("${google.gemini.api.key:}")
    private String geminiApiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private static final String SYSTEM_INSTRUCTION_ANALYSIS = 
        "Bạn là chuyên gia về phân loại rác tại Việt Nam. " +
        "Nhiệm vụ: Nhìn ảnh, xác định rác, phân loại và hướng dẫn xử lý. " +
        "Trả lời bằng JSON. Ngôn ngữ: Tiếng Việt.";

    @Override
    public AiClassificationResponse classifyWaste(String photoUrl) {
        String isEnabled = systemSettingService.getSettingValue("AI_CLASSIFICATION_ENABLED", "true");
        if (!Boolean.parseBoolean(isEnabled)) {
            log.warn("AI Classification is disabled.");
            return mockResponse("Disabled");
        }

        log.info("Classifying waste from photo URL/Data: {}", photoUrl.substring(0, Math.min(photoUrl.length(), 50)));

        try {
            String base64Data = photoUrl;
            if (photoUrl.startsWith("data:image")) {
                base64Data = photoUrl.split(",")[1];
            }

            String model = systemSettingService.getSettingValue("GEMINI_MODEL_NAME", "gemini-1.5-flash");
            String url = String.format(GEMINI_API_URL, model, geminiApiKey);

            // Construct Gemini Request manually to avoid deep DTO nesting complexity for now
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("inlineData", Map.of("mimeType", "image/jpeg", "data", base64Data)),
                        Map.of("text", "Đây là rác gì? Phân loại và hướng dẫn xử lý.")
                    ))
                ),
                "generationConfig", Map.of(
                    "responseMimeType", "application/json",
                    "responseSchema", Map.of(
                        "type", "OBJECT",
                        "properties", Map.of(
                            "itemName", Map.of("type", "STRING"),
                            "wasteType", Map.of("type", "STRING", "enum", List.of("RECYCLABLE", "ORGANIC", "HAZARDOUS", "NON_RECYCLABLE", "UNKNOWN")),
                            "confidence", Map.of("type", "NUMBER"),
                            "advice", Map.of("type", "STRING"),
                            "recyclingSteps", Map.of("type", "ARRAY", "items", Map.of("type", "STRING"))
                        ),
                        "required", List.of("itemName", "wasteType", "confidence", "advice")
                    )
                ),
                "systemInstruction", Map.of("parts", List.of(Map.of("text", SYSTEM_INSTRUCTION_ANALYSIS)))
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String responseStr = restTemplate.postForObject(url, entity, String.class);
            JsonNode root = objectMapper.readTree(responseStr);
            String content = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            JsonNode resultJson = objectMapper.readTree(content);
            String aiWasteType = resultJson.path("wasteType").asText();
            
            // Map AI waste type to DB waste type
            WasteType dbType = mapToDbType(aiWasteType);

            List<String> recyclingSteps = new java.util.ArrayList<>();
            if (resultJson.has("recyclingSteps") && resultJson.get("recyclingSteps").isArray()) {
                resultJson.get("recyclingSteps").forEach(step -> recyclingSteps.add(step.asText()));
            }

            return AiClassificationResponse.builder()
                .wasteTypeId(dbType != null ? dbType.getWasteTypeId() : null)
                .wasteTypeName(resultJson.path("itemName").asText())
                .confidence(resultJson.path("confidence").asText())
                .explanation(resultJson.path("advice").asText())
                .recyclingSteps(recyclingSteps)
                .build();

        } catch (Exception e) {
            log.error("AI Classification failed", e);
            return mockResponse("Error: " + e.getMessage());
        }
    }

    private WasteType mapToDbType(String aiWasteType) {
        String searchName = "Hữu cơ"; // Default for ORGANIC
        if ("RECYCLABLE".equals(aiWasteType)) searchName = "Nhựa"; // Simple heuristic
        else if ("HAZARDOUS".equals(aiWasteType)) searchName = "Nguy hại";
        else if ("NON_RECYCLABLE".equals(aiWasteType)) searchName = "Hữu cơ";
        
        final String finalSearch = searchName;
        return wasteTypeRepository.findAllActive().stream()
                .filter(t -> t.getName().contains(finalSearch))
                .findFirst()
                .orElse(null);
    }

    @Override
    public String getChatbotResponse(String message) {
        String model = systemSettingService.getSettingValue("GEMINI_MODEL_NAME", "gemini-1.5-flash");
        String url = String.format(GEMINI_API_URL, model, geminiApiKey);

        try {
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(Map.of("text", message)))
                ),
                "systemInstruction", Map.of("parts", List.of(Map.of("text", 
                    "Bạn là EcoBot, trợ lý ảo thân thiện. Trả lời ngắn gọn, súc tích bằng Tiếng Việt về chủ đề rác thải và môi trường.")))
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String responseStr = restTemplate.postForObject(url, entity, String.class);
            JsonNode root = objectMapper.readTree(responseStr);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        } catch (Exception e) {
            log.error("AI Chatbot failed", e);
            return "Xin lỗi, tôi đang bận xử lý dữ liệu. Thử lại sau nhé!";
        }
    }

    private AiClassificationResponse mockResponse(String msg) {
        return AiClassificationResponse.builder()
                .wasteTypeName("Khác")
                .confidence("0")
                .explanation(msg)
                .build();
    }
}
