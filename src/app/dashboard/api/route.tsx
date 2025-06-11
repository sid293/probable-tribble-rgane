import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { YoutubeTranscript } from 'youtube-transcript';
import { getTranscript } from '@/lib/transcript'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export async function POST(req: Request) {
    try {
        console.log('dashboard/api API endpoint hit:');
        const session = await auth();
        const userId = session?.userId;
        
        if (!userId) {
            console.log('Unauthorized access attempt:');
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { url } = await req.json();
        console.log('Received URL:', url);
        const videoId = extractVideoId(url);

        if (!videoId) {
            console.log('Invalid YouTube URL provided:');
            return NextResponse.json(
                { message: 'Invalid YouTube URL' },
                { status: 400 }
            );
        }

        // Get or create user
        console.log('Fetching user data:');
        const user = await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                email: '', // You can get this from Clerk if needed
                credits: 0
            }
        });
        console.log('User data retrieved:', user);

        // Check if user has enough credits
        if (user.credits <= 0) {
            console.log('Insufficient credits for user:', userId);
            return NextResponse.json(
                { message: 'Insufficient credits' },
                { status: 400 }
            );
        }

        // Get video transcript
        console.log('videoid:', videoId);
        console.log('Fetching video transcript:');
        let transcriptData;
        try {
            transcriptData = await getTranscript(videoId);
        } catch (error: any) {
            console.error('Transcript error:', error);
            return NextResponse.json(
                { 
                    message: 'This video does not have captions available. Please try a different video with captions enabled.',
                    error: error.message
                },
                { status: 400 }
            );
        }

        if (!transcriptData || transcriptData.trim() === '') {
            console.log('Empty transcript received');
            return NextResponse.json(
                { 
                    message: 'This video does not have captions available. Please try a different video with captions enabled.',
                    error: 'No transcript content'
                },
                { status: 400 }
            );
        }
        console.log('Transcript retrieved successfully:');

        // Generate summary using Gemini
        console.log('Generating summary with Gemini:');
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Please provide a concise summary of the following video transcript:\n\n${transcriptData}`;
        
        const result = await model.generateContent(prompt);
        const summary = result.response.text();
        console.log('Summary generated successfully:');

        // Create summary entry
        console.log('Creating summary entry in database:');
        await prisma.summary.create({
            data: {
                videoUrl: url,
                userId: user.id,
                summary,
                videoTitle: url // Using URL as title since we don't have title from transcript
            }
        });

        // Deduct credits
        console.log('Deducting credits from user:');
        await prisma.user.update({
            where: { id: userId },
            data: {
                credits: {
                    decrement: 1
                }
            }
        });

        console.log('Request completed successfully:');
        return NextResponse.json({ 
            message: 'Success',
            summary,
            videoTitle: url, // Using URL as title
            id: Date.now().toString()
        });
    } catch (error) {
        console.error('Error in API endpoint:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}