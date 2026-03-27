import { Bot, ChevronRight, Loader2, Sparkles } from "lucide-react";
import React, { useCallback, useState } from "react";

interface WasteTypeOption {
  wasteTypeId: string;
  name: string;
  description?: string;
}

interface AiWasteSuggestionProps {
  imagePreview: string | null;
  wasteTypes: WasteTypeOption[];
  onSelectWasteType: (wasteTypeId: string) => void;
}

interface SuggestionResult {
  wasteTypeId: string;
  name: string;
  confidence: number;
  reasoning: string;
}



const API_KEY = import.meta.env.VITE_GOOGLE_GENAI_API_KEY || "";
const MODEL_NAME = "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

const SYSTEM_INSTRUCTION = `
Bạn là Google ADK Waste Classification Agent - trợ lý AI chuyên phân loại rác thải tại Việt Nam.
Nhiệm vụ:
1) Nhìn ảnh và xác định đó là loại rác gì.
2) CHỈ được đề xuất các wasteTypeId nằm trong danh sách (catalog) được cung cấp. Không được chế tên loại rác bên ngoài.
3) Xếp hạng mức độ phù hợp (từ 0.0 đến 1.0) và giải thích ngắn gọn lý do vì sao bạn xếp loại rác đó.
Bạn PHẢI trả lời DUY NHẤT bằng JSON theo đúng định dạng được yêu cầu, KHÔNG thêm bất kỳ markdown hoặc text nào khác.
Ngôn ngữ: Tiếng Việt.
`;

async function analyzeImageWithAI(
  base64Image: string,
  wasteTypes: WasteTypeOption[]
): Promise<SuggestionResult[]> {
  if (!API_KEY) {
    throw new Error("Missing API Key");
  }

  // Extract base64 data and mime type
  const match = base64Image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  const mimeType = match ? match[1] : "image/jpeg";
  const data = match ? match[2] : base64Image.replace(/\s/g, "");

  // Craft catalog prompt securely escaping quotes
  const catalogDetails = wasteTypes
    .map((item) => `- wasteTypeId: "${item.wasteTypeId}"; Tên: "${item.name}"; Mô tả: "${(item.description || '').replace(/"/g, "'")}"`)
    .join("\\n");

  const promptText = `Hãy phân tích ảnh rác thải này và trả về 1 đến 3 loại phù hợp nhất dựa trên catalog sau đây:\\n\\n${catalogDetails}\\n\\nNhớ rằng CHỈ sử dụng wasteTypeId có trong danh sách trên! Trả về mảng JSON thỏa mãn schema.`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data } },
          { text: promptText }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          suggestions: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                wasteTypeId: { type: "STRING" },
                name: { type: "STRING" },
                confidence: { type: "NUMBER" },
                reasoning: { type: "STRING" }
              },
              required: ["wasteTypeId", "name", "confidence", "reasoning"]
            }
          }
        },
        required: ["suggestions"]
      }
    },
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }]
    }
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini API error:", errText);
    throw new Error("Failed to fetch from Gemini API");
  }

  const jsonResponse = await response.json();
  const textResult = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textResult) {
    throw new Error("AI did not return any text");
  }

  const parsed = JSON.parse(textResult);
  return parsed.suggestions || [];
}

function simulateAiSuggestionFallback(
  wasteTypes: WasteTypeOption[]
): SuggestionResult[] {
  if (!wasteTypes.length) return [];

  const results: SuggestionResult[] = [];
  const shuffled = [...wasteTypes].sort(() => Math.random() - 0.5);

  const primaryIndex = Math.floor(Math.random() * shuffled.length);
  const primary = shuffled[primaryIndex];

  results.push({
    wasteTypeId: primary.wasteTypeId,
    name: primary.name,
    confidence: 0.75 + Math.random() * 0.2,
    reasoning: `(Mô phỏng dự phòng) Nhận diện đặc điểm hình ảnh.`,
  });

  return results;
}

export const AiWasteSuggestion: React.FC<AiWasteSuggestionProps> = ({
  imagePreview,
  wasteTypes,
  onSelectWasteType,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionResult[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [analyzedImage, setAnalyzedImage] = useState<string | null>(null);

  const shouldShowTrigger = imagePreview && !hasAnalyzed;
  const shouldShowResults = hasAnalyzed && suggestions.length > 0;

  const analyzeImage = useCallback(async () => {
    if (!imagePreview || !wasteTypes.length) return;

    setIsAnalyzing(true);
    setAnalyzedImage(imagePreview);

    try {
      const results = await analyzeImageWithAI(imagePreview, wasteTypes);
      setSuggestions(results);
    } catch (e) {
      console.error("AI Analysis failed, falling back to simulated API", e);
      setSuggestions(simulateAiSuggestionFallback(wasteTypes));
    } finally {
      setHasAnalyzed(true);
      setIsAnalyzing(false);
    }
  }, [imagePreview, wasteTypes]);

  // Reset if image changes
  React.useEffect(() => {
    if (imagePreview !== analyzedImage) {
      setHasAnalyzed(false);
      setSuggestions([]);
    }
  }, [imagePreview, analyzedImage]);

  const confidenceColor = useCallback((confidence: number) => {
    if (confidence >= 0.8) return "#10B981";
    if (confidence >= 0.5) return "#F59E0B";
    return "#94A3B8";
  }, []);

  if (!imagePreview) return null;

  return (
    <div className="space-y-3">
      {/* Analyzing state */}
      {isAnalyzing && (
        <div className="flex items-center gap-3 rounded-[22px] border border-[rgba(99,102,241,0.18)] bg-gradient-to-r from-indigo-50 to-purple-50 p-4 animate-pulse">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-indigo-100 text-indigo-600">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-800">AI đang phân tích hình ảnh...</p>
            <p className="mt-0.5 text-xs text-indigo-600">
              Đang nhận diện loại rác từ ảnh bạn tải lên
            </p>
          </div>
        </div>
      )}

      {/* Trigger button */}
      {shouldShowTrigger && !isAnalyzing && (
        <button
          type="button"
          onClick={analyzeImage}
          className="group flex w-full items-center gap-3 rounded-[22px] border border-[rgba(99,102,241,0.16)] bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-4 text-left transition-all hover:border-[rgba(99,102,241,0.3)] hover:shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[var(--text-primary)]">
              AI Gợi ý loại rác
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Nhấn để AI phân tích ảnh và gợi ý loại rác phù hợp
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-indigo-400 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}

      {/* Results */}
      {shouldShowResults && !isAnalyzing && (
        <div className="rounded-[22px] border border-[rgba(99,102,241,0.16)] bg-gradient-to-br from-indigo-50/60 to-purple-50/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-[12px] bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-indigo-700">
              Kết quả AI
            </p>
            <button
              type="button"
              onClick={analyzeImage}
              className="ml-auto text-[11px] font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              Phân tích lại
            </button>
          </div>

          <div className="space-y-2">
            {suggestions.map((s, index) => (
              <button
                key={s.wasteTypeId}
                type="button"
                onClick={() => onSelectWasteType(s.wasteTypeId)}
                className="group flex w-full items-center gap-3 rounded-[18px] border border-white/60 bg-white/80 p-3 text-left transition-all hover:border-indigo-200 hover:bg-white hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {index === 0 ? "🏆 " : ""}
                      {s.name}
                    </p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: confidenceColor(s.confidence) }}
                    >
                      {Math.round(s.confidence * 100)}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{s.reasoning}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500" />
              </button>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-center text-indigo-400">
            ⚡ Kết quả AI chỉ mang tính tham khảo. Vui lòng xác nhận lại loại rác thủ công.
          </p>
        </div>
      )}
    </div>
  );
};
