import type { Metadata } from "next";
import "./globals.css";
import { WebSocketProvider } from "@/components/WebSocketProvider";

export const metadata: Metadata = {
  title: "CORAL INTELLIGENCE — Mission Control Dashboard",
  description: "Real-time coral ecosystem monitoring & AI-powered bleaching prediction for Thailand marine zones",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ background: "var(--bg-deep)", color: "var(--text-primary)" }}>
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </body>
    </html>
  );
}
