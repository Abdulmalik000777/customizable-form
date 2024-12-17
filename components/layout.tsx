import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="bg-gray-100 dark:bg-gray-800 py-4">
        <nav className="container mx-auto px-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-800 dark:text-white"
          >
            FormCraft
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/templates"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Templates
            </Link>
            <Link
              href="/login"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Login
            </Link>
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-gray-100 dark:bg-gray-800 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
          © 2024 FormCraft. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
