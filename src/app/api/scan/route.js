import { NextResponse } from 'next/server';

// Simplified version for Vercel free tier - NO AI processing, NO cache
// Just returns formatted Google Search results

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');

        if (!query) {
            return NextResponse.json({ listings: [] });
        }

        console.log("Processing query:", query);

        // Google Custom Search API
        const GOOGLE_API_KEY = process.env.GEMINI_API_KEY;
        const CX = process.env.GOOGLE_SEARCH_ENGINE_ID;

        if (!GOOGLE_API_KEY || !CX) {
            console.error("Missing API keys");
            return NextResponse.json({
                error: "Server configuration error",
                listings: []
            }, { status: 500 });
        }

        const searchQ = `${query} alquiler departamento -venta`;
        const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${CX}&q=${encodeURIComponent(searchQ)}&num=10`;

        console.log("Fetching from Google...");
        const googleRes = await fetch(googleUrl);

        if (!googleRes.ok) {
            console.error("Google Search failed:", googleRes.status);
            return NextResponse.json({
                error: `Google Search failed: ${googleRes.status}`,
                listings: []
            }, { status: 500 });
        }

        const googleData = await googleRes.json();
        const searchResults = googleData.items || [];
        console.log(`Found ${searchResults.length} results`);

        // Simple formatting without AI
        const listings = searchResults.map((item) => {
            // Extract images
            const images = [];
            if (item.pagemap?.cse_image) {
                images.push(...item.pagemap.cse_image.map(img => img.src));
            }
            if (item.pagemap?.metatags?.[0]?.['og:image']) {
                images.push(item.pagemap.metatags[0]['og:image']);
            }

            // Simple phone extraction
            const snippet = item.snippet || '';
            const phoneMatch = snippet.match(/(\+54\s*9?\s*)?(\d{2,4})[\s-]?(\d{4})[\s-]?(\d{4})/);
            const phone = phoneMatch ? `+54 9 ${phoneMatch[2]} ${phoneMatch[3]}-${phoneMatch[4]}` : null;

            return {
                id: item.link,
                title: item.title,
                description: item.snippet || '',
                price: 0,
                currency: 'ARS',
                location: query,
                bedrooms: 1,
                bathrooms: 1,
                amenities: [],
                images: [...new Set(images)].slice(0, 5),
                contact: phone ? { phone, source: 'text' } : null,
                source: new URL(item.link).hostname,
                url: item.link,
                aiAnalysis: {
                    summary: 'Resultado de búsqueda - Verifica los detalles en el enlace original',
                    priceRating: 'Consultar',
                    fraudScore: 0
                },
                postedAt: new Date().toISOString()
            };
        });

        console.log(`Returning ${listings.length} formatted listings`);
        return NextResponse.json({ listings });

    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({
            error: error.message,
            listings: []
        }, { status: 500 });
    }
}
