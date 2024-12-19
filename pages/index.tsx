"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  LayoutDashboard,
  BarChart2,
  Users,
  Sun,
  Moon,
} from "lucide-react";
import PageLayout from "../components/layout";
import { useAuth } from "../contexts/auth-context";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const features = [
    {
      icon: FileText,
      title: "Custom Forms",
      description:
        "Create fully customizable forms with various question types",
    },
    {
      icon: LayoutDashboard,
      title: "Templates",
      description: "Save and reuse form templates for quick access",
    },
    {
      icon: BarChart2,
      title: "Analytics",
      description: "View detailed analytics and responses visualization",
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Share forms and work together with your team",
    },
  ];

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-fade-in">
                Welcome to FormCraft
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Create and manage customizable forms with ease. Build powerful
                forms, collect responses, and analyze data all in one place.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg" className="rounded-full">
                  <Link href={isAuthenticated ? "/templates" : "/register"}>
                    {isAuthenticated ? "Explore Templates" : "Get Started"}
                  </Link>
                </Button>
                {!isAuthenticated && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-full"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                )}
                {isMounted && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    className="rounded-full"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5 mr-2" />
                    ) : (
                      <Moon className="h-5 w-5 mr-2" />
                    )}
                    Toggle Theme
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border border-primary/10 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="pt-6">
                    <div className="rounded-full bg-primary/10 p-3 w-12 h-12 mb-4 flex items-center justify-center">
                      {isMounted && (
                        <feature.icon className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
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

        {/* Footer */}
        <footer className="py-6 border-t border-primary/10 bg-muted/30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <p className="text-center text-muted-foreground">
              © {new Date().getFullYear()} FormCraft. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </PageLayout>
  );
}
