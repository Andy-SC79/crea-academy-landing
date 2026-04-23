import { Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import TourController from "@/components/landing/tour/TourController";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
      <BrowserRouter>
        <Suspense fallback={
          <div className="flex h-screen w-full items-center justify-center bg-black">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-neon border-t-transparent"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<TourController />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
