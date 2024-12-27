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
  lng: "en", // default language
  fallbackLng: "en",
  defaultNS: "common",
  ns: ["common"],
  interpolation: {
    escapeValue: false,
  },
});

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language") || "en";
    setLanguage(storedLanguage);
    i18n.changeLanguage(storedLanguage);
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => {
      const currentLang = i18n.language;
      document.documentElement.lang = currentLang;
      setLanguage(currentLang);
    };

    window.addEventListener("languagechange", handleLanguageChange);
    return () =>
      window.removeEventListener("languagechange", handleLanguageChange);
  }, []);

  const changeLanguage = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      setLanguage(lang);
      localStorage.setItem("language", lang);
      // Force re-render by updating document language and triggering a state update
      document.documentElement.lang = lang;
      window.dispatchEvent(new Event("languagechange"));
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>
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
