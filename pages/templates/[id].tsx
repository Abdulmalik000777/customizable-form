import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { fetchWithAuth } from "../../utils/api";
import { ProtectedRoute } from "../../components/protected-route";
import Link from "next/link";

interface Question {
  id: string;
  type: string;
  title: string;
  description: string | null;
  required: boolean;
}

interface Template {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
}

function TemplatePage() {
  const router = useRouter();
  const { id } = router.query;
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplate() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`/api/templates/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch template");
        }
        const data = await response.json();
        setTemplate(data);
      } catch (error) {
        console.error("Error fetching template:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTemplate();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !template) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Template not found"}</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">{template.title}</h1>
          <Button variant="outline" asChild>
            <Link href="/templates">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{template.description || "No description provided."}</p>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold mb-4">Questions</h2>
        {template.questions.map((question, index) => (
          <Card key={question.id} className="mb-4">
            <CardHeader>
              <CardTitle className="text-xl">
                {index + 1}. {question.title}
                {question.required && (
                  <span className="text-red-500 ml-2">*</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {question.description}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Type: {question.type}
              </p>
            </CardContent>
          </Card>
        ))}

        <div className="mt-8 flex justify-between">
          <Button asChild>
            <Link href={`/templates/${template.id}/edit`}>Edit Template</Link>
          </Button>
          <Button asChild>
            <Link href={`/templates/${template.id}/submit`}>Fill Out Form</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}

export default function TemplatePageWrapper() {
  return (
    <ProtectedRoute>
      <TemplatePage />
    </ProtectedRoute>
  );
}
