import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Background from "@/components/Background";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "IGNITE Submission Portal",
  description: "Submit your IGNITE project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black relative`}>
        <Background />
        <Providers>
          <div className="relative z-20">{children}</div>
        </Providers>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
