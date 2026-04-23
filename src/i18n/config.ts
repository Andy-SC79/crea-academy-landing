import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import landingES from "./locales/es/landing.json";
import commonES from "./locales/es/common.json";

import landingEN from "./locales/en/landing.json";
import commonEN from "./locales/en/common.json";

import landingPT from "./locales/pt/landing.json";
import commonPT from "./locales/pt/common.json";

const resources = {
  es: { landing: landingES, common: commonES },
  en: { landing: landingEN, common: commonEN },
  pt: { landing: landingPT, common: commonPT }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "es",
  fallbackLng: "es",
  defaultNS: "landing",
  interpolation: { escapeValue: false }
});

export default i18n;
