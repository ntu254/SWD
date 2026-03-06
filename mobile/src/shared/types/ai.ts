export enum WasteType {
    RECYCLABLE = 'RECYCLABLE',
    ORGANIC = 'ORGANIC',
    HAZARDOUS = 'HAZARDOUS',
    NON_RECYCLABLE = 'NON_RECYCLABLE',
    UNKNOWN = 'UNKNOWN'
}

export interface AnalysisResult {
    wasteType: WasteType;
    itemName: string;
    confidence: number;
    advice: string;
    recyclingSteps?: string[];
}
