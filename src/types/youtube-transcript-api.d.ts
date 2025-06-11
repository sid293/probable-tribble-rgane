declare module 'youtube-transcript-api' {
    interface TranscriptItem {
        text: string;
        duration: number;
        offset: number;
    }
    
    class TranscriptAPI {
        static getTranscript(id: string, langCode?: string, config?: any): Promise<TranscriptItem[]>;
        static validateID(id: string, config?: any): Promise<boolean>;
    }
    
    export default TranscriptAPI;
} 