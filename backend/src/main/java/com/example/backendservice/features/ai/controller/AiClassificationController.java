package com.example.backendservice.features.ai.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.ai.dto.AiClassificationResponse;
import com.example.backendservice.features.ai.service.AiClassificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Assistant", description = "APIs for AI-powered waste classification and chatbot")
public class AiClassificationController {

    private final AiClassificationService aiClassificationService;

    @Operation(summary = "Classify waste from photo URL")
    @PostMapping("/classify")
    public ResponseEntity<ApiResponse<AiClassificationResponse>> classifyWaste(@RequestParam String photoUrl) {
        AiClassificationResponse response = aiClassificationService.classifyWaste(photoUrl);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Chat with AI assistant")
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<String>> chat(@RequestBody com.example.backendservice.features.ai.dto.ChatRequest request) {
        String response = aiClassificationService.getChatbotResponse(request.getMessage());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
