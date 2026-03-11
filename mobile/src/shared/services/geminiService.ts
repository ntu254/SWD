import { AnalysisResult, WasteType } from '../types/ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''; // Should be set in .env
const MODEL_NAME = 'gemini-2.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

const SYSTEM_INSTRUCTION_ANALYSIS = `
Bạn là chuyên gia về phân loại rác tại Việt Nam. 
Nhiệm vụ: Nhìn ảnh, xác định rác, phân loại và hướng dẫn xử lý.
Trả lời bằng JSON. Ngôn ngữ: Tiếng Việt.
`;

const SYSTEM_INSTRUCTION_CHAT = `
Bạn là EcoBot, trợ lý ảo thân thiện. Trả lời ngắn gọn, súc tích bằng Tiếng Việt về chủ đề rác thải và môi trường.
`;

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

/**
 * Phân tích hình ảnh rác thải sử dụng Gemini API trực tiếp từ Frontend
 */
export const analyzeImage = async (base64Image: string): Promise<AnalysisResult> => {
    try {
        if (!API_KEY) {
            throw new Error("Missing Gemini API Key in Frontend.");
        }

        // Clean base64 header if present
        const cleanData = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

        const requestBody = {
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: cleanData } },
                    { text: "Đây là rác gì? Phân loại và hướng dẫn xử lý." }
                ]
            },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        itemName: { type: "STRING" },
                        wasteType: {
                            type: "STRING",
                            enum: [
                                WasteType.RECYCLABLE,
                                WasteType.ORGANIC,
                                WasteType.HAZARDOUS,
                                WasteType.NON_RECYCLABLE,
                                WasteType.UNKNOWN
                            ]
                        },
                        confidence: { type: "NUMBER" },
                        advice: { type: "STRING" },
                        recyclingSteps: { type: "ARRAY", items: { type: "STRING" } }
                    },
                    required: ["itemName", "wasteType", "confidence", "advice"]
                }
            },
            systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTION_ANALYSIS }]
            }
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResult) throw new Error("AI không phản hồi kết quả.");

        return JSON.parse(textResult) as AnalysisResult;

    } catch (error) {
        console.error("Lỗi phân tích ảnh (Frontend):", error);
        return {
            wasteType: WasteType.UNKNOWN,
            itemName: "Lỗi nhận diện",
            confidence: 0,
            advice: "Đã có lỗi kết nối với AI. Vui lòng kiểm tra API Key hoặc kết nối mạng.",
            recyclingSteps: []
        };
    }
};

/**
 * Chat với EcoBot (Dành cho màn hình hỗ trợ)
 */
export const chatWithAi = async (message: string, history: ChatMessage[] = []): Promise<string> => {
    try {
        if (!API_KEY) return "Vui lòng cấu hình API Key để chat với EcoBot.";

        const requestBody = {
            contents: [
                ...history,
                { role: 'user', parts: [{ text: message }] }
            ],
            systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTION_CHAT }]
            }
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error("Lỗi kết nối AI.");

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Tôi chưa hiểu ý bạn.";

    } catch (error) {
        console.error("Lỗi Chat (Frontend):", error);
        return "Đang gặp sự cố kết nối. Thử lại sau nhé!";
    }
};
