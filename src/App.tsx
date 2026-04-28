import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useTranslation } from "react-i18next";
import TourController from "@/components/landing/tour/TourController";

const BootcampIA = lazy(() => import("@/pages/BootcampIA"));

export default function App() {
  const { t } = useTranslation("common");

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="bg-black min-h-screen text-white flex justify-center items-center">
              {t("actions.loading")}
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<TourController />} />
            <Route path="/bootcamp-ia" element={<BootcampIA />} />
            <Route path="/bootcamp" element={<BootcampIA />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
