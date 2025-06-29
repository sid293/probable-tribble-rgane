import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

        if (!WEBHOOK_SECRET) {
            throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
        }

        // Get the headers
        const headerPayload = await headers();
        const svix_id = headerPayload.get("svix-id");
        const svix_timestamp = headerPayload.get("svix-timestamp");
        const svix_signature = headerPayload.get("svix-signature");

        // If there are no headers, error out
        if (!svix_id || !svix_timestamp || !svix_signature) {
            console.error('Missing svix headers:', { svix_id, svix_timestamp, svix_signature });
            return new Response('Error occurred -- no svix headers', {
                status: 400
            });
        }

        // Get the body
        const rawBody = await req.text();
        // console.log('Received webhook body:', rawBody);

        if (!rawBody) {
            return new Response('Error occurred -- no body', {
                status: 400
            });
        }

        const body = rawBody;

        // Create a new Svix instance with your secret.
        const wh = new Webhook(WEBHOOK_SECRET);

        let evt: WebhookEvent;

        // Verify the payload with the headers
        try {
            evt = wh.verify(body, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            }) as WebhookEvent;
        } catch (err) {
            console.error('Error verifying webhook:', err);
            return new Response('Error occurred', {
                status: 400
            });
        }

        // Handle the webhook
        const eventType = evt.type;
        console.log('Processing webhook event:', eventType);

        if (eventType === 'user.created') {
            const { id, email_addresses } = evt.data;
            const email = email_addresses[0]?.email_address;

            if (!email) {
                return NextResponse.json(
                    { message: 'No email found' },
                    { status: 400 }
                );
            }

            // Create new user with initial credits
            await prisma.user.create({
                data: {
                    id,
                    email,
                    credits: 10 // Initial credits
                }
            });

            return NextResponse.json({ message: 'User created successfully' });
        }

        return NextResponse.json({ message: 'Webhook processed' });
    } catch (error) {
        console.error('Webhook error:', error);
        return new Response('Error processing webhook', {
            status: 500
        });
    }
} 