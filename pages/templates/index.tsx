import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { ButtonProps, buttonVariants } from "../../components/ui/button";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { fetchWithAuth } from "../../utils/api";
import { cn } from "../../utils/cn";
import SlotComponent from "../../components/ui/slot";
import { useAuth } from "../../contexts/auth-context";
import { ProtectedRoute } from "../../components/protected-route";
import { useTranslation } from "react-i18next";

interface Template {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  _count: {
    questions: number;
  };
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? SlotComponent : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const { t } = useTranslation("common");

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetchWithAuth("/api/templates");
        if (!response.ok) {
          if (response.status === 401) {
            logout();
            return;
          }
          throw new Error(t("templates.fetchError"));
        }
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setError(
          error instanceof Error
            ? error.message
            : t("templates.unexpectedError")
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [logout, t]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              {t("templates.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t("templates.subtitle")}
            </p>
          </div>
          <Button asChild className="h-10">
            <Link href="/templates/create">
              <Plus className="w-5 h-5 mr-2" />
              {t("templates.createNew")}
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              {t("templates.loading")}
            </p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("common.error")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                {t("templates.noTemplates")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                {t("templates.createFirst")}
              </p>
              <Button asChild>
                <Link href="/templates/create">
                  <Plus className="w-5 h-5 mr-2" />
                  {t("templates.createTemplate")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-xl">{template.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {template.description || t("templates.noDescription")}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(template.createdAt).toLocaleDateString()} •{" "}
                      {t("templates.questionCount", {
                        count: template._count.questions,
                      })}
                    </span>
                    <Button variant="outline" asChild>
                      <Link href={`/templates/${template.id}`}>
                        {t("templates.view")}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function Templates() {
  return (
    <ProtectedRoute>
      <TemplatesPage />
    </ProtectedRoute>
  );
}
