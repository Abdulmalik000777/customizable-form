import React from "react";
import { useLanguage } from "../contexts/language-context";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation("common");

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "uz" : "en");
  };

  return (
    <Button onClick={toggleLanguage} variant="outline" size="sm">
      {language === "en" ? "UZ" : "EN"}
    </Button>
  );
};
