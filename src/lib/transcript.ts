import YoutubeTranscript from 'youtube-transcript-api';

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

interface TranscriptResponse {
  text: string;
  duration: number;
  offset: number;
}

interface TranscriptError {
  message: string;
  error: string;
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

export async function getTranscript(videoId: string): Promise<string> {
  try {
    const transcript = await YoutubeTranscript.getTranscript(videoId);
    return transcript.map((item: TranscriptResponse) => item.text).join(' ');
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw new Error('Failed to fetch transcript');
  }
}

export async function getTranscriptWithTimestamps(videoId: string): Promise<TranscriptResponse[]> {
  try {
    return await YoutubeTranscript.getTranscript(videoId);
  } catch (error) {
    console.error('Error fetching transcript with timestamps:', error);
    throw new Error('Failed to fetch transcript with timestamps');
  }
}

export async function getTranscriptWithMetadata(videoId: string): Promise<{
  transcript: TranscriptResponse[];
  metadata: {
    videoId: string;
    timestamp: number;
  };
}> {
  try {
    const transcript = await YoutubeTranscript.getTranscript(videoId);
    return {
      transcript,
      metadata: {
        videoId,
        timestamp: Date.now()
      }
    };
  } catch (error) {
    console.error('Error fetching transcript with metadata:', error);
    throw new Error('Failed to fetch transcript with metadata');
  }
}
