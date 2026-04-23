import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import TourController from "@/components/landing/tour/TourController";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <BrowserRouter>
        <Suspense fallback={<div className="bg-black min-h-screen text-white flex justify-center items-center">Cargando...</div>}>
          <Routes>
            <Route path="/" element={<TourController />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
