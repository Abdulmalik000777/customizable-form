import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Plus,
  Loader2,
  AlertCircle,
  Eye,
  FileText,
  Trash2,
  Search,
  Calendar,
  HelpCircle,
} from "lucide-react";
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
  const { logout, refreshAuthToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation("common");

  const router = useRouter();

  const fetchTemplates = async () => {
    try {
      const response = await fetchWithAuth("/api/templates");
      if (response.status === 401) {
        await refreshAuthToken();
        // Retry the request after refreshing the token
        const retryResponse = await fetchWithAuth("/api/templates");
        if (!retryResponse.ok) throw new Error("Failed to fetch templates");
        const data = await retryResponse.json();
        setTemplates(data);
      } else if (!response.ok) {
        throw new Error("Failed to fetch templates");
      } else {
        const data = await response.json();
        setTemplates(data);
      }
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
  }, []);

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
          <p className="text-lg text-muted-foreground">
            {t("templates.loading")}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              {t("templates.title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("templates.subtitle")}
            </p>
          </div>
          <Button asChild size="lg" className="shadow-lg">
            <Link href="/templates/create">
              <Plus className="w-5 h-5 mr-2" />
              {t("templates.createNew")}
            </Link>
          </Button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">
              {t("templates.loading")}
            </p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("common.error")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredTemplates.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                {searchQuery ? (
                  <Search className="w-10 h-10 text-primary" />
                ) : (
                  <HelpCircle className="w-10 h-10 text-primary" />
                )}
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-center">
                {searchQuery
                  ? t("search.noResults")
                  : t("templates.noTemplates")}
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                {searchQuery
                  ? t("search.tryDifferentQuery")
                  : t("templates.createFirst")}
              </p>
              {!searchQuery && (
                <Button asChild size="lg">
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
                className="group hover:shadow-lg transition-all duration-300 border-primary/10"
              >
                <CardHeader>
                  <CardTitle className="text-xl font-semibold line-clamp-1">
                    {template.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(template.createdAt).toLocaleDateString()}
                    <span className="text-primary font-medium">
                      {t("templates.questionCount", {
                        count: template._count.questions,
                      })}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 line-clamp-2 min-h-[3rem]">
                    {template.description || t("templates.noDescription")}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      asChild
                      className="flex-1 group-hover:border-primary/20"
                    >
                      <Link href={`/templates/${template.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        {t("templates.viewQuestions")}
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
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
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
