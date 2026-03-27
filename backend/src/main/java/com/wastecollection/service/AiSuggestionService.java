package com.wastecollection.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.wastecollection.entity.SystemSetting;
import com.wastecollection.entity.WasteType;
import com.wastecollection.repository.SystemSettingRepository;
import com.wastecollection.repository.WasteTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiSuggestionService {

    private final SystemSettingRepository systemSettingRepository;
    private final WasteTypeRepository wasteTypeRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    // Default System Instruction from Frontend ported to Backend
    private static final String SYSTEM_INSTRUCTION = 
            "You are a highly capable AI assistant embedded in a citizen waste reporting app. " +
            "Your task is to analyze an image of a waste item uploaded by a user and categorize it " +
            "into ONE OR MORE of the standard waste categories defined in the application's catalog. " +
            "\n\nCRITICAL CONSTRAINTS:" +
            "\n1. You MUST ONLY use the 'wasteTypeId' values provided in the CURRENT CATALOG below. Do not invent new IDs." +
            "\n2. If the image contains multiple types of waste, provide a suggestion for each distinct type." +
            "\n3. Be extremely accurate. If you are unsure, provide a lower confidence score." +
            "\n4. If the image does not appear to contain any identifiable waste, return an empty array." +
            "\n5. The 'reasoning' must be in Vietnamese, brief, and explain why this classification was chosen based on visual evidence." +
            "\n\nCURRENT CATALOG:\n";

    public String getGeminiApiKey() {
        return systemSettingRepository.findById("GEMINI_API_KEY")
                .map(SystemSetting::getSettingValue)
                .filter(val -> val != null && !val.trim().isEmpty())
                .orElseThrow(() -> new RuntimeException("GEMINI_API_KEY chưa được cấu hình ở phần Cài đặt Admin."));
    }

    public String analyzeImage(String base64Image, String mimeType) {
        String apiKey = getGeminiApiKey();
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        List<WasteType> activeWasteTypes = wasteTypeRepository.findByIsActiveTrue();
        if (activeWasteTypes.isEmpty()) {
            throw new RuntimeException("Chưa có loại rác nào trong hệ thống.");
        }

        String currentCatalog = activeWasteTypes.stream()
                .map(wt -> String.format("- id: \"%s\", Tên: \"%s\", Mô tả: \"%s\"",
                        wt.getWasteTypeId(), wt.getName(), wt.getDescription() == null ? "" : wt.getDescription()))
                .collect(Collectors.joining("\n"));

        String fullInstruction = SYSTEM_INSTRUCTION + currentCatalog;

        try {
            // Build the generation config JSON dynamically
            ObjectNode requestBody = objectMapper.createObjectNode();
            
            // Build contents
            ArrayNode contentsArray = requestBody.putArray("contents");
            ObjectNode contentItem = contentsArray.addObject();
            contentItem.put("role", "user");
            ArrayNode partsArray = contentItem.putArray("parts");

            // Part 1: Image mapping
            ObjectNode inlineDataNode = partsArray.addObject().putObject("inlineData");
            inlineDataNode.put("mimeType", mimeType);
            String base64Data = base64Image;
            
            // Remove the data URL prefix if it exists
            if (base64Data.contains(",")) {
                base64Data = base64Data.split(",")[1];
            }
            inlineDataNode.put("data", base64Data);

            // Part 2: Prompt
            partsArray.addObject().put("text", "Please identify the waste in this image based on the catalog provided in the system instructions.");

            // Build generationConfig
            ObjectNode generationConfig = requestBody.putObject("generationConfig");
            generationConfig.put("responseMimeType", "application/json");

            ObjectNode responseSchema = generationConfig.putObject("responseSchema");
            responseSchema.put("type", "OBJECT");
            
            ArrayNode requiredRoot = responseSchema.putArray("required");
            requiredRoot.add("suggestions");

            ObjectNode propertiesRoot = responseSchema.putObject("properties");
            ObjectNode suggestionsProp = propertiesRoot.putObject("suggestions");
            suggestionsProp.put("type", "ARRAY");

            ObjectNode itemsDef = suggestionsProp.putObject("items");
            itemsDef.put("type", "OBJECT");
            
            ArrayNode requiredItems = itemsDef.putArray("required");
            requiredItems.add("wasteTypeId");
            requiredItems.add("name");
            requiredItems.add("confidence");
            requiredItems.add("reasoning");

            ObjectNode propertiesItem = itemsDef.putObject("properties");
            propertiesItem.putObject("wasteTypeId").put("type", "STRING");
            propertiesItem.putObject("name").put("type", "STRING");
            propertiesItem.putObject("confidence").put("type", "NUMBER");
            propertiesItem.putObject("reasoning").put("type", "STRING");

            // Build systemInstruction
            ObjectNode systemInstructionNode = requestBody.putObject("systemInstruction");
            ArrayNode sysParts = systemInstructionNode.putArray("parts");
            sysParts.addObject().put("text", fullInstruction);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String jsonString = objectMapper.writeValueAsString(requestBody);
            log.info("Sending payload to Gemini: {}", jsonString);
            HttpEntity<String> request = new HttpEntity<>(jsonString, headers);

            String response = restTemplate.postForObject(apiUrl, request, String.class);
            return response;

        } catch (Exception e) {
            log.error("Error calling Gemini API: ", e);
            if (e.getMessage() != null && e.getMessage().contains("429 Too Many Requests")) {
                throw new RuntimeException("QUOTA_EXCEEDED");
            }
            throw new RuntimeException("Lỗi kết nối AI: " + e.getMessage());
        }
    }
}
