import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/auth-context";
import { Button } from "./ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

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
              FormCraft
            </Link>
            <div className="space-x-4">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/templates">Templates</Link>
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
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
