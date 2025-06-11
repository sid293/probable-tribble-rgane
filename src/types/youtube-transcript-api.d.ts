declare module 'youtube-transcript-api' {
    interface TranscriptResponse {
        text: string;
        duration: number;
        offset: number;
    }
    
    interface TranscriptOptions {
        lang?: string;
        country?: string;
    }
    
    interface TranscriptError {
        message: string;
        error: string;
    }
    
    function getTranscript(videoId: string, options?: TranscriptOptions): Promise<TranscriptResponse[]>;
    
    export default {
        getTranscript
    };
} 