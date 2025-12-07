export const MOCK_LISTINGS = [
    {
        id: '1',
        title: 'Modern Apartment in Palermo Soho',
        description: 'Beautiful 2 bedroom apartment with balcony, fully furnished. Includes high-speed internet and weekly cleaning.',
        price: 450000,
        currency: 'ARS',
        location: 'Palermo, Buenos Aires',
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['Balcony', 'WiFi', 'AC', 'Security'],
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
        source: 'Facebook Marketplace',
        aiAnalysis: {
            fraudScore: 0.1, // Low risk
            isDuplicate: false,
            priceRating: 'Fair',
            summary: 'Legitimate listing with consistent details across platforms.'
        },
        postedAt: new Date().toISOString(),
    },
    {
        id: '2',
        title: 'Cozy Studio in Recoleta',
        description: 'Perfect for students. Near universities and subway. Quiet building.',
        price: 300000,
        currency: 'ARS',
        location: 'Recoleta, Buenos Aires',
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['Elevator', 'Heating'],
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
        source: 'Instagram',
        aiAnalysis: {
            fraudScore: 0.05,
            isDuplicate: false,
            priceRating: 'Good Deal',
            summary: 'Verified owner based on history.'
        },
        postedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
        id: '3',
        title: 'Spacious House with Garden',
        description: '3 bedrooms, large garden with BBQ area. Ideal for families.',
        price: 850000,
        currency: 'ARS',
        location: 'Belgrano, Buenos Aires',
        bedrooms: 3,
        bathrooms: 2,
        amenities: ['Garden', 'BBQ', 'Parking', 'Pet Friendly'],
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
        source: 'Reddit',
        aiAnalysis: {
            fraudScore: 0.2,
            isDuplicate: false,
            priceRating: 'Expensive',
            summary: 'Price is slightly above market average for this zone.'
        },
        postedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    },
    // Add more to simulate the "10 limit"
    ...Array.from({ length: 12 }).map((_, i) => ({
        id: `generated-${i}`,
        title: `Apartment Option ${i + 4}`,
        description: 'Great opportunity in a central location. Contact for more details.',
        price: 350000 + (i * 10000),
        currency: 'ARS',
        location: i % 2 === 0 ? 'San Telmo, Buenos Aires' : 'Caballito, Buenos Aires',
        bedrooms: (i % 3) + 1,
        bathrooms: 1,
        amenities: ['WiFi', 'Kitchen'],
        images: ['https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80'],
        source: 'X (Twitter)',
        aiAnalysis: {
            fraudScore: Math.random() * 0.3,
            isDuplicate: Math.random() > 0.9,
            priceRating: 'Average',
            summary: 'AI analyzed content.'
        },
        postedAt: new Date(Date.now() - (i * 3600000)).toISOString(),
    }))
];
