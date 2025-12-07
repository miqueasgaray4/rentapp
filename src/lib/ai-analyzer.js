/**
 * Simulates AI analysis of a rental post.
 * In a real app, this would call the Gemini API or similar.
 */
export async function analyzeRentalPost(postContent, imageUrls) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock logic to determine fraud/duplicates
    const isTooGoodToBeTrue = postContent.toLowerCase().includes('free') || postContent.includes('$1');

    return {
        fraudScore: isTooGoodToBeTrue ? 0.9 : 0.1,
        isDuplicate: Math.random() > 0.8, // 20% chance of being a duplicate in this mock
        priceRating: 'Market Average',
        extractedDetails: {
            bedrooms: 2, // Mock extraction
            bathrooms: 1,
            amenities: ['WiFi', 'AC'],
        },
        summary: 'Listing appears legitimate based on text analysis. Image reverse search found no exact matches on other platforms.'
    };
}
