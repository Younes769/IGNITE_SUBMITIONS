import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Project Submission Portal",
  description:
    "Submit your project materials including Figma, BMC, and presentation files",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-black">
        <Providers />
        {children}
      </body>
    </html>
  );
}
