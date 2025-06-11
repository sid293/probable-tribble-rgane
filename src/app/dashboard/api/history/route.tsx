import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await auth();
        const userId = session?.userId;
        
        if (!userId) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const summaries = await prisma.summary.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ summaries });
    } catch (error) {
        console.error('Error fetching summaries:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 