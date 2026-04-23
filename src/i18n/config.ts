import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import landingES from "./locales/es/landing.json";
import commonES from "./locales/es/common.json";

const resources = {
  es: { landing: landingES, common: commonES }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "es",
  fallbackLng: "es",
  defaultNS: "landing",
  interpolation: { escapeValue: false }
});

export default i18n;
