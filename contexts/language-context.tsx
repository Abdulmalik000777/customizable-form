import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "../public/locales/en/common.json";
import uzCommon from "../public/locales/uz/common.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    uz: { common: uzCommon },
  },
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [language, setLanguage] = useState(router.locale || "en");

  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    router.push(router.pathname, router.asPath, { locale: lang });
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
