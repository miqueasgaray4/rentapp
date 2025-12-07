// require('dotenv').config({ path: '.env.local' });

async function testSearch() {
    const apiKey = process.env.GEMINI_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;

    console.log("Testing with:");
    console.log("API Key:", apiKey ? apiKey.substring(0, 10) + "..." : "MISSING");
    console.log("CX:", cx);

    // Test 1: Custom Search
    console.log("\n--- Testing Custom Search API ---");
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=test`;
    try {
        const res = await fetch(searchUrl);
        const data = await res.json();
        if (!res.ok) console.error("❌ Custom Search Failed:", data.error?.message || data);
        else console.log("✅ Custom Search Works! Found", data.items?.length, "results.");
    } catch (e) { console.error("❌ Network Error (Search):", e.message); }

    // Test 2: Gemini API
    console.log("\n--- Testing Gemini API ---");
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    try {
        const res = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
        });
        const data = await res.json();
        if (!res.ok) console.error("❌ Gemini Failed:", data.error?.message || data);
        else console.log("✅ Gemini Works!");
    } catch (e) { console.error("❌ Network Error (Gemini):", e.message); }
}

testSearch();
