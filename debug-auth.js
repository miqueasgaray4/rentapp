// Quick debug script to check Firebase and auth state
console.log("=== Firebase Debug ===");
console.log("Environment variables:");
console.log("NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "SET" : "NOT SET");
console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

// Check localStorage for mock user
if (typeof window !== 'undefined') {
    const mockUser = localStorage.getItem('mockUser');
    console.log("Mock user in localStorage:", mockUser ? "EXISTS" : "NONE");
    if (mockUser) {
        console.log("Mock user data:", JSON.parse(mockUser));
    }
}
