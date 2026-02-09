import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "What To Cook — Save Money by Cooking What You Already Have",
  description: "Stop wasting groceries. AI-powered meal suggestions from your pantry ingredients. Reduce food waste, save money, and end the nightly dinner stress. Free for families.",
  keywords: "what to cook with ingredients I have, reduce food waste app, family meal planner, budget cooking app, use up leftover ingredients",
  openGraph: {
    title: "What To Cook — Save Money by Cooking What You Have",
    description: "Stop wasting $2,000/year in groceries. Get AI-powered meal suggestions from ingredients you already have.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen bg-[var(--background)]`}>
        <Providers>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
