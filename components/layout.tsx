import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/auth-context";
import { useLanguage } from "../contexts/language-context";
import { Button } from "./ui/button";
import { Globe, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes"; // Import useTheme

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const { theme, setTheme } = useTheme(); // Replace local state with useTheme
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  //Remove: const [theme, setTheme] = React.useState('dark');

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const toggleLanguage = () => {
    const newLang = language === "en" ? "uz" : "en";
    setLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-background">
      {" "}
      {/* Remove data-theme attribute */}
      <header className="bg-card shadow">
        <nav className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-lg font-semibold text-foreground">
              FormCraft
            </Link>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/templates">Templates</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/templates">Dashboard</Link>
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
                    Logout
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
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/register">Register</Link>
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
