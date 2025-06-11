// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    
    const YoutubeTranscriptApi: {
        getTranscript: typeof getTranscript;
    };
    export default YoutubeTranscriptApi;
} 