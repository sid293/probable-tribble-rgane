import TranscriptAPI from 'youtube-transcript-api';

interface CaptionSnippet {
    videoId: string;
    lastUpdated: string;
    trackKind: string;
    language: string;
    name: string;
    audioTrackType: string;
    isCC: boolean;
    isLarge: boolean;
    isEasyReader: boolean;
    isDraft: boolean;
    isAutoSynced: boolean;
    status: string;
}

interface Caption {
    kind: string;
    etag: string;
    id: string;
    snippet: CaptionSnippet;
}

async function getVideoDetails(videoId: string) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
        );
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            throw new Error('Video not found');
        }

        return {
            title: data.items[0].snippet.title,
            description: data.items[0].snippet.description,
            publishedAt: data.items[0].snippet.publishedAt
        };
    } catch (error: any) {
        console.error('Error fetching video details:', error);
        throw new Error('Failed to fetch video details');
    }
}

async function getCaptionsList(videoId: string) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&part=snippet&key=${process.env.YOUTUBE_API_KEY}`
        );
        const data = await response.json();
        return data.items || [];
    } catch (error: any) {
        console.error('Error fetching captions list:', error);
        return [];
    }
}

async function getCaptionsContent(videoId: string, captionId: string) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${process.env.YOUTUBE_API_KEY}`
        );
        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error('Error fetching captions content:', error);
        throw error;
    }
}

export async function getTranscript(videoId: string) {
    let videoDetails;
    try {
        console.log('Fetching video details for ID:', videoId);
        videoDetails = await getVideoDetails(videoId);
        console.log('Video title:', videoDetails.title);

        // Get transcript using youtube-transcript-api
        console.log('Fetching transcript...');
        const transcript = await TranscriptAPI.getTranscript(videoId);
        
        
        if (!transcript || transcript.length === 0) {
            throw new Error('No captions available for this video');
        }

        const transcriptText = transcript.map((item: { text: string }) => item.text).join(' ');
        console.log('Successfully fetched transcript');

        return {
            title: videoDetails.title,
            transcript: transcriptText
        };
    } catch (error: any) {
        console.error('Error in getTranscript:', error);
        // Try with different language if first attempt fails
        try {
            console.log('Retrying with different language...');
            const transcript = await TranscriptAPI.getTranscript(videoId, 'en');
            const transcriptText = transcript.map((item: { text: string }) => item.text).join(' ');
            
            if (!videoDetails) {
                videoDetails = await getVideoDetails(videoId);
            }
            
            return {
                title: videoDetails.title,
                transcript: transcriptText
            };
        } catch (retryError: any) {
            console.error('Error in retry attempt:', retryError);
            throw new Error(`Failed to fetch transcript: ${retryError.message}`);
        }
    }
}
