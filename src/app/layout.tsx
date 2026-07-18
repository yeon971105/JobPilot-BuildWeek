import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const serif = Cormorant_Garamond({ variable: "--font-editorial-serif", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = { title: { default: "JobPilot — Find the Roles Worth Your Time", template: "%s · JobPilot" }, description: "JobPilot helps application-fatigued job seekers move from scattered listings to confident applications with nearby discovery, resume-aware prioritization, clear evidence, and direct employer destinations." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" data-scroll-behavior="smooth" className={`${sans.variable} ${mono.variable} ${serif.variable}`}><body>{children}</body></html>; }
