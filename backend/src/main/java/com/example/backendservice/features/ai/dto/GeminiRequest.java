package com.example.backendservice.features.ai.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeminiRequest {
    private String model;
    private List<Content> contents;
    private GenerationConfig generationConfig;
    private String systemInstruction;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Content {
        private List<Part> parts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Part {
        private String text;
        private InlineData inlineData;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InlineData {
        private String mimeType;
        private String data;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerationConfig {
        private String responseMimeType;
        private ResponseSchema responseSchema;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResponseSchema {
        private String type; // OBJECT, ARRAY, etc
        private java.util.Map<String, Property> properties;
        private List<String> required;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Property {
        private String type;
        private String description;
        private List<String> enumeration;
        private Property items;
    }
}
