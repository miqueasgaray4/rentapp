import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

export async function POST(request) {
    try {
        const body = await request.json();

        // Get the base URL dynamically (works in dev and production)
        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000';

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: 'pack-10-listings',
                        title: '10 Alquileres Premium - RentAI',
                        quantity: 1,
                        unit_price: 1000,
                        currency_id: 'ARS'
                    }
                ],
                back_urls: {
                    success: `${baseUrl}/?payment=success`,
                    failure: `${baseUrl}/?payment=failure`,
                    pending: `${baseUrl}/?payment=pending`
                },

            }
        });

        return NextResponse.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        console.error("MercadoPago Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
