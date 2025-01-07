import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/auth-context";
import { useLanguage } from "../contexts/language-context";
import { Button } from "./ui/button";
import { Globe, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation("common");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const toggleLanguage = (newLang: string) => {
    setLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow">
        <nav className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-lg font-semibold text-foreground">
              {t("appName")}
            </Link>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-w-[120px] font-medium hover:bg-accent/20"
                    asChild
                  >
                    <Link href="/dashboard">{t("nav.dashboard")}</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-w-[120px] font-medium hover:bg-accent/20"
                    asChild
                  >
                    <Link href="/templates">{t("nav.myForms")}</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    className="w-10 h-10 p-0"
                  >
                    {mounted &&
                      (theme === "dark" ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      ))}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleLanguage(language === "en" ? "uz" : "en")
                    }
                    className="min-w-[80px] font-medium"
                  >
                    {language === "en" ? "UZ" : "EN"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="min-w-[100px] font-medium hover:bg-destructive/10"
                  >
                    {t("nav.logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    className="w-10 h-10 p-0"
                  >
                    {mounted &&
                      (theme === "dark" ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      ))}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleLanguage(language === "en" ? "uz" : "en")
                    }
                    className="min-w-[80px] font-medium"
                  >
                    {language === "en" ? "UZ" : "EN"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="min-w-[100px] font-medium hover:bg-accent/20"
                  >
                    <Link href="/login">{t("nav.login")}</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="min-w-[100px] font-medium hover:bg-destructive/10"
                  >
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
