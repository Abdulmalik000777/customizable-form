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
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { fetchWithAuth } from "../../utils/api";
import { useAuth } from "../../contexts/auth-context";
import { ProtectedRoute } from "../../components/protected-route";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Template {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  _count: {
    questions: number;
  };
}

function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation("common");

  const router = useRouter();

  const fetchTemplates = async () => {
    try {
      const response = await fetchWithAuth("/api/templates");
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error("Failed to fetch templates");
      }
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [logout]);

  const filteredTemplates = templates.filter(
    (template) =>
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteTemplate = async (id: string) => {
    try {
      const response = await fetchWithAuth(`/api/templates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      // Refresh the templates list
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            {t("templates.loading")}
          </p>
        </div>
      </Layout>
    );
  }

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

        <div className="mb-6">
          <Input
            type="text"
            placeholder={t("search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {error ? (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("common.error")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                {searchQuery
                  ? t("search.noResults")
                  : t("templates.noTemplates")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                {searchQuery
                  ? t("search.tryDifferentQuery")
                  : t("templates.createFirst")}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/templates/create">
                    <Plus className="w-5 h-5 mr-2" />
                    {t("templates.createTemplate")}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          {t("templates.delete")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("templates.deleteConfirmTitle")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("templates.deleteConfirmDescription")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t("common.cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteTemplate(template.id)}
                          >
                            {t("common.delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
