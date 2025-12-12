import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCachedSearch, setCachedSearch } from '@/lib/cache';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
console.log("Initializing Gemini with API Key present:", !!apiKey);
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Extract phone numbers from text using Gemini Vision OCR
 * @param {string} imageUrl - URL of the image to process
 * @returns {Promise<string|null>} Extracted phone number or null
 */
async function extractContactFromImage(imageUrl) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        // Fetch image and convert to base64
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) return null;

        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');

        const prompt = `Analiza esta imagen y extrae SOLO números de teléfono o contacto.
        Busca patrones como:
        - +54 9 11 1234-5678
        - 11-1234-5678
        - 1234567890
        - WhatsApp: [número]
        - Tel: [número]
        
        Si encuentras un número, devuélvelo en formato internacional argentino: +54 9 AREA NUMERO
        Si NO hay números de teléfono, devuelve exactamente: "NONE"
        Solo devuelve el número o "NONE", nada más.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Image
                }
            }
        ]);

        const text = result.response.text().trim();
        return text === "NONE" ? null : text;
    } catch (error) {
        console.error('OCR extraction failed:', error);
        return null;
    }
}

/**
 * Extract phone number from text snippet
 * @param {string} text - Text to search
 * @returns {string|null} Formatted phone number or null
 */
function extractPhoneFromText(text) {
    if (!text) return null;

    // Argentine phone patterns
    const patterns = [
        /(?:\+54\s?9?\s?)?(\d{2,4})[\s-]?(\d{4})[\s-]?(\d{4})/g, // General format
        /(?:tel|teléfono|celular|whatsapp|wa)[\s:]+(\d[\d\s-]{8,})/gi, // With prefix
        /(\d{10,11})/g // Raw 10-11 digits
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            // Clean and format
            const cleaned = match[0].replace(/\D/g, '');
            if (cleaned.length >= 10) {
                // Format as +54 9 AREA NUMBER
                const areaCode = cleaned.slice(-10, -8);
                const number = cleaned.slice(-8);
                return `+54 9 ${areaCode} ${number}`;
            }
        }
    }

    return null;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');

        if (!query) {
            return NextResponse.json({ listings: [] });
        }

        console.log("Processing query:", query);

        // Check cache first
        const cachedResults = await getCachedSearch(query);
        if (cachedResults) {
            console.log("Returning cached results - API call saved!");
            return NextResponse.json({ listings: cachedResults, cached: true });
        }

        // Google Custom Search API
        const GOOGLE_API_KEY = process.env.GEMINI_API_KEY;
        const CX = process.env.GOOGLE_SEARCH_ENGINE_ID;

        // Construct query to ensure we get rentals
        const searchQ = `${query} alquiler departamento -venta`;
        const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${CX}&q=${encodeURIComponent(searchQ)}&num=10`;

        console.log("Fetching Google Search...");
        const googleRes = await fetch(googleUrl);

        if (!googleRes.ok) {
            const err = await googleRes.text();
            console.error("Google Search API Error:", err);
            throw new Error(`Google Search API failed: ${googleRes.status}`);
        }

        const googleData = await googleRes.json();
        const searchResults = googleData.items || [];
        console.log(`Found ${searchResults.length} results from Google.`);

        if (searchResults.length === 0) {
            return NextResponse.json({ listings: [] });
        }

        // Extract images and prepare data for Gemini
        const enrichedResults = searchResults.map(item => {
            const images = [];

            // Extract images from pagemap
            if (item.pagemap?.cse_image) {
                images.push(...item.pagemap.cse_image.map(img => img.src));
            }
            if (item.pagemap?.metatags?.[0]?.['og:image']) {
                images.push(item.pagemap.metatags[0]['og:image']);
            }

            return {
                title: item.title,
                link: item.link,
                snippet: item.snippet,
                source: item.displayLink,
                images: [...new Set(images)].slice(0, 5) // Unique images, max 5
            };
        });

        // Process with Gemini to extract structured data
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `Actúa como un agente inmobiliario experto. Extrae información estructurada de estos resultados de búsqueda.

Input (Resultados de búsqueda):
${JSON.stringify(enrichedResults)}

Instrucciones:
1. Analiza título, snippet e imágenes de cada resultado
2. Extrae: Precio (ARS), Ubicación, Dormitorios, Baños
3. Extrae números de teléfono del snippet (busca patrones como: 11-1234-5678, +54 9 11..., WhatsApp:, Tel:)
4. Si encuentras un número, formátalo como: +54 9 AREA NUMERO
5. DESCARTA resultados que sean VENTAS o artículos de noticias
6. Incluye las URLs de imágenes en el array 'images'
7. Si falta info, estima razonablemente o usa valores por defecto

Output JSON array:
[{
    "id": "string (usa el link como ID único)",
    "title": "string (limpio y conciso)",
    "description": "string (basado en snippet)",
    "price": number (0 si no se encuentra),
    "currency": "ARS",
    "location": "string (barrio/zona)",
    "bedrooms": number (default: 1),
    "bathrooms": number (default: 1),
    "amenities": ["string"],
    "images": ["url1", "url2"],
    "contact": {
        "phone": "string (+54 9 formato) o null",
        "source": "text" o "image"
    },
    "source": "string (ej: Facebook, MercadoLibre)",
    "url": "string (link original)",
    "aiAnalysis": {
        "summary": "string (análisis breve)",
        "priceRating": "Excelente" | "Bueno" | "Promedio" | "Alto",
        "fraudScore": number (0.0-1.0, donde 1.0 es alta probabilidad de fraude)
    },
    "postedAt": "string (ISO date, estima si no está disponible)"
}]

IMPORTANTE: Solo devuelve JSON válido, sin texto adicional.`;

        const result = await model.generateContent(prompt);
        const cleanJson = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        let listings = [];
        try {
            listings = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse Gemini response", cleanJson);
            return NextResponse.json({ listings: [] });
        }

        console.log(`Generated ${listings.length} structured listings.`);

        // OCR Enhancement: TEMPORARILY DISABLED to prevent Vercel timeout
        // TODO: Re-enable after implementing background processing or upgrading Vercel plan
        /*
        const ocrPromises = listings.map(async (listing) => {
            if (!listing.contact?.phone && listing.images && listing.images.length > 0) {
                console.log(`Attempting OCR for listing: ${listing.id}`);

                // Try OCR on first image
                const extractedPhone = await extractContactFromImage(listing.images[0]);

                if (extractedPhone) {
                    listing.contact = {
                        phone: extractedPhone,
                        source: 'image'
                    };
                    console.log(`OCR found contact: ${extractedPhone}`);
                }
            }
            return listing;
        });

        // Wait for all OCR operations
        listings = await Promise.all(ocrPromises);
        */

        // Cache the results for future requests
        if (listings.length > 0) {
            await setCachedSearch(query, listings);
        }

        return NextResponse.json({ listings, cached: false });

    } catch (error) {
        console.error("Scan error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
