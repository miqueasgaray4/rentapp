import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
console.log("Initializing Gemini with API Key present:", !!apiKey);
const genAI = new GoogleGenerativeAI(apiKey);

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');

        if (!query) {
            return NextResponse.json({ listings: [] });
        }

        console.log("Processing query:", query);

        // Google Custom Search API
        const GOOGLE_API_KEY = process.env.GEMINI_API_KEY; // User said to use the same key
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

        // Process with Gemini to extract structured data from snippets
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        Actúa como un agente inmobiliario experto. Tu tarea es extraer información estructurada de los siguientes resultados de búsqueda de Google para crear listados de alquiler.
        
        Input (Resultados de búsqueda):
        ${JSON.stringify(searchResults.map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            source: item.displayLink
        })))}

        Instrucciones:
        1. Analiza el título y el snippet de cada resultado.
        2. Extrae: Precio (si está disponible, estima en ARS), Ubicación, Dormitorios, etc.
        3. Si falta información (ej: dormitorios), haz una estimación educada basada en el precio/descripción o pon 1.
        4. DESCARTA resultados que sean claramente VENTAS o no sean propiedades (ej: artículos de noticias).
        5. Para la imagen ('images'), usa la 'pagemap.cse_image' si está disponible en el input original (no se pasó aquí, pero asume que no hay imagen fiable y deja el array vacío o usa una genérica si quieres, pero mejor vacío). 
        *Corrección*: No tengo acceso a pagemap aquí. Deja 'images' como array vacío [].

        Output JSON array:
        [{
            "id": "string (usa el link)",
            "title": "string (limpio)",
            "description": "string (basado en snippet)",
            "price": number (0 si no se encuentra),
            "currency": "ARS",
            "location": "string",
            "bedrooms": number,
            "bathrooms": number,
            "amenities": ["string"],
            "images": [], 
            "contact": null,
            "source": "string (ej: Facebook, MercadoLibre)",
            "url": "string (link original)",
            "aiAnalysis": {
                "summary": "string",
                "priceRating": "string"
            },
            "postedAt": "string (ISO date)"
        }]
        
        Solo devuelve JSON válido.
        `;

        const result = await model.generateContent(prompt);
        const cleanJson = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        let listings = [];
        try {
            listings = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse Gemini response", cleanJson);
        }

        console.log(`Generated ${listings.length} structured listings.`);
        return NextResponse.json({ listings });

    } catch (error) {
        console.error("Scan error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
