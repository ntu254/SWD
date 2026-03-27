package com.wastecollection.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wastecollection.common.ApiResponse;
import com.wastecollection.service.AiSuggestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public/ai")
@RequiredArgsConstructor
@Slf4j
public class AiSuggestionController {

    private final AiSuggestionService aiSuggestionService;
    private final ObjectMapper objectMapper;

    @PostMapping("/suggest")
    public ResponseEntity<ApiResponse<JsonNode>> suggest(@RequestBody Map<String, String> request) {
        String base64Image = request.get("image");
        String mimeType = request.getOrDefault("mimeType", "image/jpeg");

        if (base64Image == null || base64Image.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Base64 image is required"));
        }

        try {
            String jsonResult = aiSuggestionService.analyzeImage(base64Image, mimeType);
            
            // Parse Gemini response to get the inner "suggestions" logic
            JsonNode root = objectMapper.readTree(jsonResult);
            JsonNode textResultNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            
            if (textResultNode.isMissingNode() || textResultNode.isNull()) {
                throw new RuntimeException("AI did not return any text. Full response: " + jsonResult);
            }

            JsonNode parsedSuggestions = objectMapper.readTree(textResultNode.asText());
            
            return ResponseEntity.ok(ApiResponse.success(parsedSuggestions.path("suggestions")));
        } catch (Exception e) {
            log.error("AI Error", e);
            if (e.getMessage() != null && e.getMessage().contains("QUOTA_EXCEEDED")) {
                return ResponseEntity.status(429).body(ApiResponse.error("QUOTA_EXCEEDED"));
            }
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }
}
