import { NextResponse } from 'next/server';
import { addCredits } from '@/lib/userCredits';

/**
 * MercadoPago Webhook Handler
 * Receives payment notifications and updates user credits
 * 
 * Webhook URL: https://www.encontraralquiler.com/api/payment/webhook
 */
export async function POST(request) {
    try {
        const body = await request.json();

        console.log('Webhook received:', JSON.stringify(body, null, 2));

        // MercadoPago sends different types of notifications
        const { type, action, data } = body;

        // We're interested in payment notifications
        if (type === 'payment') {
            const paymentId = data?.id;

            if (!paymentId) {
                console.error('No payment ID in webhook');
                return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
            }

            // Fetch payment details from MercadoPago
            const paymentDetails = await getPaymentDetails(paymentId);

            if (!paymentDetails) {
                console.error('Could not fetch payment details');
                return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
            }

            console.log('Payment details:', paymentDetails);

            // Check if payment is approved
            if (paymentDetails.status === 'approved') {
                // Extract user ID from metadata (we'll add this in create-preference)
                const userId = paymentDetails.metadata?.user_id;

                if (!userId) {
                    console.error('No user ID in payment metadata');
                    return NextResponse.json({ error: 'No user ID' }, { status: 400 });
                }

                // Add 10 credits to user
                const success = await addCredits(userId, 10);

                if (success) {
                    console.log(`✅ Added 10 credits to user ${userId} for payment ${paymentId}`);
                    return NextResponse.json({
                        success: true,
                        message: 'Credits added successfully'
                    });
                } else {
                    console.error('Failed to add credits');
                    return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 });
                }
            } else {
                console.log(`Payment ${paymentId} status: ${paymentDetails.status} - no action taken`);
                return NextResponse.json({
                    success: true,
                    message: 'Payment not approved yet'
                });
            }
        }

        // For other notification types, just acknowledge
        return NextResponse.json({ success: true, message: 'Webhook received' });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Fetch payment details from MercadoPago API
 * @param {string} paymentId - MercadoPago payment ID
 * @returns {Promise<Object|null>} Payment details or null
 */
async function getPaymentDetails(paymentId) {
    try {
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            console.error('MercadoPago API error:', response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching payment details:', error);
        return null;
    }
}

/**
 * GET handler - for testing webhook endpoint
 */
export async function GET() {
    return NextResponse.json({
        message: 'MercadoPago Webhook Endpoint',
        status: 'active',
        url: 'https://www.encontraralquiler.com/api/payment/webhook'
    });
}
