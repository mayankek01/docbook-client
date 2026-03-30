import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DocsBook - Find & Book Doctors",
  description: "Find doctors near you and book appointments online",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}