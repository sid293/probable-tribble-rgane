import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // Verify the request is from Vercel Cron
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Update credits for all users
        await prisma.user.updateMany({
            data: {
                credits: {
                    increment: 10
                }
            }
        });

        return NextResponse.json({ message: 'Credits updated successfully' });
    } catch (error) {
        console.error('Error updating credits:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 