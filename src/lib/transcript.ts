import YoutubeTranscript from 'youtube-transcript-api';

interface TranscriptResponse {
  text: string;
  duration: number;
  offset: number;
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
