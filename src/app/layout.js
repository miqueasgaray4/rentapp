import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'RentAI - Smart Rental Finder',
  description: 'Find your next home with AI-powered rental analysis.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--text-main)]">
        <Navbar />
        <main className="min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </body>
    </html>
  );
}
