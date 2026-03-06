package com.example.backendservice.features.ai.service;

import com.example.backendservice.features.ai.dto.AiClassificationResponse;

public interface AiClassificationService {
    AiClassificationResponse classifyWaste(String photoUrl);
    String getChatbotResponse(String message);
}
