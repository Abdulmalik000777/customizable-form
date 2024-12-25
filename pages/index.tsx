"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";
import Layout from "../components/layout";
import { useAuth } from "../contexts/auth-context";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

// Dynamically import icons
const FileText = dynamic(
  () => import("lucide-react").then((mod) => mod.FileText),
  { ssr: false }
);
const LayoutDashboard = dynamic(
  () => import("lucide-react").then((mod) => mod.LayoutDashboard),
  { ssr: false }
);
const BarChart2 = dynamic(
  () => import("lucide-react").then((mod) => mod.BarChart2),
  { ssr: false }
);
const Users = dynamic(() => import("lucide-react").then((mod) => mod.Users), {
  ssr: false,
});
const Sun = dynamic(() => import("lucide-react").then((mod) => mod.Sun), {
  ssr: false,
});
const Moon = dynamic(() => import("lucide-react").then((mod) => mod.Moon), {
  ssr: false,
});

// Client-side only wrapper component
const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

export default function Home() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation("common");

  const features = [
    {
      icon: FileText,
      title: t("home.features.customForms.title"),
      description: t("home.features.customForms.description"),
    },
    {
      icon: LayoutDashboard,
      title: t("home.features.templates.title"),
      description: t("home.features.templates.description"),
    },
    {
      icon: BarChart2,
      title: t("home.features.analytics.title"),
      description: t("home.features.analytics.description"),
    },
    {
      icon: Users,
      title: t("home.features.collaboration.title"),
      description: t("home.features.collaboration.description"),
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <section className="relative py-24 lg:py-32">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-fade-in mb-8">
                {t("home.welcome")}
              </h1>
              <p className="text-lg leading-8 text-muted-foreground mb-12">
                {t("home.description")}
              </p>
              <div className="flex flex-col gap-4 items-center">
                <Button asChild size="lg" className="w-full max-w-sm text-lg">
                  <Link href={isAuthenticated ? "/templates" : "/register"}>
                    {isAuthenticated
                      ? t("home.exploreTemplates")
                      : t("home.getStarted")}
                  </Link>
                </Button>

                {!isAuthenticated && (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="w-full max-w-sm text-lg"
                    >
                      <Link href="/login">{t("nav.login")}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="secondary"
                      size="lg"
                      className="w-full max-w-sm text-lg"
                    >
                      <Link href="/register">{t("nav.register")}</Link>
                    </Button>
                  </>
                )}

                <ClientOnly>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    className="w-full max-w-sm text-lg"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5 mr-2" />
                    ) : (
                      <Moon className="h-5 w-5 mr-2" />
                    )}
                    {t("home.toggleTheme")}
                  </Button>
                </ClientOnly>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-muted/30">
          <div className="container px-4 mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">
              {t("home.keyFeatures")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border border-primary/10 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="pt-8 pb-6 px-6">
                    <ClientOnly>
                      <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mb-6 flex items-center justify-center">
                        <feature.icon className="w-8 h-8 text-primary" />
                      </div>
                    </ClientOnly>
                    <h3 className="text-xl font-semibold mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <footer className="py-6 border-t border-primary/10 bg-muted/30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <p className="text-center text-muted-foreground">
              © {new Date().getFullYear()} {t("appName")}.{" "}
              {t("home.allRightsReserved")}
            </p>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
