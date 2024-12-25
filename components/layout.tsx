import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/auth-context";
import { Button } from "./ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { Search } from "./search";
import { useTranslation } from "react-i18next";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { t } = useTranslation("common");

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow">
        <nav className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-lg font-semibold text-foreground">
              {t("appName")}
            </Link>
            <Search />
            <div className="space-x-4 flex items-center">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/templates">{t("nav.myForms")}</Link>
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    {t("nav.logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">{t("nav.login")}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/register">{t("nav.register")}</Link>
                  </Button>
                </>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
};

export default Layout;
