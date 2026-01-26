import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

const getAI = () => new GoogleGenAI({ apiKey });

export const getGeminiResponse = async (userMessage: string): Promise<string> => {

    try {
        if (!apiKey) return "Hệ thống đang bảo trì kết nối.";

        const model = 'gemini-3-flash-preview';
        const systemInstruction = `
      Bạn là 'EcoBot', trợ lý của GreenLoop.
      Nhiệm vụ: Hỗ trợ phân loại rác theo quy định 2025 (Hữu cơ, Tái chế, Cồng kềnh, Nguy hại).
      Trả lời ngắn gọn, thân thiện.
    `;

        const response = await getAI().models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            config: { systemInstruction, temperature: 0.7 }
        });

        return response.text || "Tôi chưa nghe rõ.";
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "Đang bận xử lý, thử lại sau nhé!";
    }
};

// New function for Image Analysis
export const analyzeWasteImage = async (base64Image: string): Promise<{ type: string; confidence: string; points: number; message: string }> => {
    try {
        if (!apiKey) {
            // Mock response if no API key for UI demo
            return {
                type: 'Rác Tái Chế (Nhựa)',
                confidence: '92%',
                points: 50,
                message: 'AI phát hiện chai nhựa. Hãy ép dẹp trước khi giao cho Collector nhé!'
            };
        }

        const model = 'gemini-2.5-flash-image';
        const prompt = "Analyze this image of waste. Identify the main type of waste (Organic, Recyclable, Hazardous, or Bulky). Return a JSON with keys: type (string in Vietnamese), confidence (percentage), points (estimated integer), and a short advice message (Vietnamese).";

        const response = await getAI().models.generateContent({
            model,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: prompt }
                ]
            },
        });

        // Simple parsing for demo purposes (In production, use responseSchema)
        const text = response.text || "";
        if (text.includes("{")) {
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                console.error("JSON Parse error", e);
            }
        }

        return {
            type: 'Đang phân tích...',
            confidence: '85%',
            points: 20,
            message: text.substring(0, 100)
        };

    } catch (error) {
        console.error("Gemini Vision Error:", error);
        return { type: 'Không xác định', confidence: '0%', points: 0, message: 'Không thể nhận diện ảnh.' };
    }
};
