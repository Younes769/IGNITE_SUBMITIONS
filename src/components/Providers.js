"use client";

import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgb(38, 38, 38)",
            color: "#fff",
            borderRadius: "0.375rem",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
          duration: 4000,
        }}
      />
    </>
  );
}
