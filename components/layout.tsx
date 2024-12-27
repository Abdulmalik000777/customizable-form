import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/auth-context";
import { useLanguage } from "../contexts/language-context";
import { Button } from "./ui/button";
import { Globe, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes"; // Import useTheme
import { useTranslation } from "react-i18next"; // Import useTranslation

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const { theme, setTheme } = useTheme(); // Replace local state with useTheme
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation("common"); // Add translation hook

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const storedLang = localStorage.getItem("language") || "en";
    setLanguage(storedLang);
  }, []);

  //Remove: const [theme, setTheme] = React.useState('dark');

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const toggleLanguage = () => {
    const newLang = language === "en" ? "uz" : "en";
    setLanguage(newLang);
    // Force immediate re-render of translated content
    document.documentElement.lang = newLang;
    window.dispatchEvent(new Event("languagechange"));
  };

  return (
    <div className="min-h-screen bg-background">
      {" "}
      {/* Remove data-theme attribute */}
      <header className="bg-card shadow">
        <nav className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-lg font-semibold text-foreground">
              {t("appName")}
            </Link>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard">{t("nav.dashboard")}</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/templates">{t("nav.myForms")}</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    {mounted &&
                      (theme === "dark" ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      ))}
                  </Button>
                  <Button variant="ghost" onClick={toggleLanguage}>
                    <Globe className="h-4 w-4 mr-2" />
                    {language.toUpperCase()}
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    {t("nav.logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    {mounted &&
                      (theme === "dark" ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      ))}
                  </Button>
                  <Button variant="ghost" onClick={toggleLanguage}>
                    <Globe className="h-4 w-4 mr-2" />
                    {language.toUpperCase()}
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/login">{t("nav.login")}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/register">{t("nav.register")}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
};

export default Layout;
