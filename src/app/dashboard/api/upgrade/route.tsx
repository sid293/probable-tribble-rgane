import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// Paddle Sandbox Configuration
const PADDLE_VENDOR_ID = process.env.PADDLE_VENDOR_ID || '';
const PADDLE_API_KEY = process.env.PADDLE_API_KEY || '';
const PADDLE_PRODUCT_ID = process.env.PADDLE_PRODUCT_ID || '';
const PADDLE_ENVIRONMENT = 'sandbox';

export async function POST(req: Request) {
    console.log("dashboard api upgrade hit");
    try {
        const session = await auth();
        const user = await currentUser();
        const userId = session?.userId;
        
        console.log("Auth check - User ID:", userId);
        console.log("User email:", user?.emailAddresses[0]?.emailAddress);
        
        // console.log("Environment variables check:", {
        //     vendorId: PADDLE_VENDOR_ID ? 'Set' : 'Not set',
        //     apiKey: PADDLE_API_KEY ? 'Set' : 'Not set',
        //     productId: PADDLE_PRODUCT_ID ? 'Set' : 'Not set',
        //     appUrl: process.env.NEXT_PUBLIC_APP_URL ? 'Set' : 'Not set'
        // });

        if (!userId || !PADDLE_VENDOR_ID || !PADDLE_API_KEY || !PADDLE_PRODUCT_ID) {
            console.log("Configuration error - Missing:", {
                userId: !userId,
                vendorId: !PADDLE_VENDOR_ID,
                apiKey: !PADDLE_API_KEY,
                productId: !PADDLE_PRODUCT_ID
            });
            return NextResponse.json(
                { message: 'Configuration error' },
                { status: 500 }
            );
        }

        const requestBody = {
            vendor_id: PADDLE_VENDOR_ID,
            vendor_auth_code: PADDLE_API_KEY,
            product_id: PADDLE_PRODUCT_ID,
            price: '25.00',
            currency: 'USD',
            customer_email: user?.emailAddresses[0]?.emailAddress || '',
            customer_country: 'US',
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
            webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/api/upgrade/webhook`,
        };

        console.log("Paddle API request body:", {
            ...requestBody,
            vendor_auth_code: '***' 
        });

        console.log("Creating Paddle checkout session...");
        const response = await fetch('https://sandbox-vendors.paddle.com/api/2.0/product/generate_pay_link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody),
        });

        const data = await response.json();
        console.log("Paddle API response:", data);

        if (!data.success) {
            console.error("Paddle API error:", data.error);
            throw new Error(data.error?.message || 'Failed to create checkout session');
        }

        console.log("Checkout URL generated successfully");
        return NextResponse.json({ url: data.response.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { message: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    console.log("Webhook received");
    try {
        const data = await req.json();
        console.log("Webhook data:", data);
        
        if (data.event_type === 'transaction.completed') {
            console.log("Processing completed transaction");
            const userId = data.customer.custom_data.userId;
            
            console.log("Adding credits to user:", userId);
            await prisma.user.update({
                where: { id: userId },
                data: {
                    credits: {
                        increment: 1000
                    }
                }
            });
            console.log("Credits added successfully");
        }

        return NextResponse.json({ message: 'Webhook processed' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { message: 'Webhook processing failed' },
            { status: 500 }
        );
    }
} 