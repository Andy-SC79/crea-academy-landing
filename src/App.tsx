import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useTranslation } from "react-i18next";
import TourController from "@/components/landing/tour/TourController";

const BootcampIA = lazy(() => import("@/pages/BootcampIA"));
const SITE_URL = "https://crea.academy";
const SOCIAL_IMAGE_URL = `${SITE_URL}/og-crea-academy.png`;

type SeoConfig = {
  title: string;
  description: string;
  canonicalPath: string;
  keywords: string;
  ogType?: string;
  structuredData: Record<string, unknown>;
};

const HOME_SEO: SeoConfig = {
  title: "Crea Academy by i365 | Certificación en IA, mentor IA y bootcamps",
  description:
    "Crea Academy by i365: plataforma de aprendizaje en IA con mentoría personalizada, certificación, rutas para equipos y Bootcamp IA práctico.",
  canonicalPath: "/",
  keywords:
    "Crea Academy, Crea by i365, cursos de inteligencia artificial, certificación en IA, bootcamp IA, mentor IA, educación tecnológica",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Crea Academy by i365",
    url: `${SITE_URL}/`,
    description:
      "Plataforma de aprendizaje en IA con mentoría personalizada, certificación y bootcamps prácticos.",
    inLanguage: "es-CO",
    isPartOf: {
      "@type": "WebSite",
      name: "Crea Academy",
      url: `${SITE_URL}/`,
    },
    publisher: {
      "@type": "Organization",
      name: "Ingeniería 365",
      url: "https://ingenieria365.com/",
    },
  },
};

const BOOTCAMP_SEO: SeoConfig = {
  title: "Bootcamp IA presencial | Crea Academy e Ingeniería 365",
  description:
    "Bootcamp IA presencial para equipos: prompt engineering, agentes, automatización, analítica asistida y prototipos aplicados en una jornada intensiva.",
  canonicalPath: "/bootcamp-ia",
  keywords:
    "bootcamp IA, bootcamp inteligencia artificial, capacitación IA empresas, prompt engineering, agentes IA, automatización con IA, Medellín",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Bootcamp IA presencial",
    url: `${SITE_URL}/bootcamp-ia`,
    description:
      "Formación intensiva presencial para aplicar inteligencia artificial en procesos reales de equipos y empresas.",
    inLanguage: "es-CO",
    provider: {
      "@type": "Organization",
      name: "Ingeniería 365",
      url: "https://ingenieria365.com/",
    },
    offers: {
      "@type": "Offer",
      price: "360",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/bootcamp-ia#cotizador`,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Presencial",
      startDate: "2026-05-22T08:00:00-05:00",
      endDate: "2026-05-22T18:00:00-05:00",
      location: {
        "@type": "Place",
        name: "Auditorio del Centro Comercial San Diego",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Medellín",
          addressRegion: "Antioquia",
          addressCountry: "CO",
        },
      },
    },
  },
};

function getSeoConfig(pathname: string) {
  if (pathname === "/bootcamp-ia" || pathname === "/bootcamp") {
    return BOOTCAMP_SEO;
  }

  return HOME_SEO;
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

function upsertRouteStructuredData(data: Record<string, unknown>) {
  const id = "route-structured-data";
  let element = document.getElementById(id) as HTMLScriptElement | null;

  if (!element) {
    element = document.createElement("script");
    element.id = id;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }

  element.text = JSON.stringify(data);
}

function SeoTags() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getSeoConfig(pathname);
    const canonicalUrl = `${SITE_URL}${seo.canonicalPath}`;

    document.documentElement.lang = "es-CO";
    document.title = seo.title;

    upsertCanonical(canonicalUrl);
    upsertMeta("name", "description", seo.description);
    upsertMeta("name", "keywords", seo.keywords);
    upsertMeta("name", "robots", "index, follow, max-image-preview:large");
    upsertMeta("property", "og:type", seo.ogType ?? "website");
    upsertMeta("property", "og:site_name", "Crea Academy");
    upsertMeta("property", "og:locale", "es_CO");
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:title", seo.title);
    upsertMeta("property", "og:description", seo.description);
    upsertMeta("property", "og:image", SOCIAL_IMAGE_URL);
    upsertMeta("property", "og:image:secure_url", SOCIAL_IMAGE_URL);
    upsertMeta("property", "og:image:type", "image/png");
    upsertMeta("property", "og:image:width", "1200");
    upsertMeta("property", "og:image:height", "630");
    upsertMeta("property", "og:image:alt", "Crea Academy by i365: aprende IA creando");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", seo.title);
    upsertMeta("name", "twitter:description", seo.description);
    upsertMeta("name", "twitter:image", SOCIAL_IMAGE_URL);
    upsertMeta("name", "twitter:image:alt", "Crea Academy by i365: aprende IA creando");
    upsertRouteStructuredData(seo.structuredData);
  }, [pathname]);

  return null;
}

export default function App() {
  const { t } = useTranslation("common");

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <BrowserRouter>
        <SeoTags />
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
