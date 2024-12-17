import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { fetchWithAuth } from "../../../utils/api";
import { ProtectedRoute } from "../../../components/protected-route";

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

function SubmitFormPage() {
  const router = useRouter();
  const { id } = router.query;
  const [template, setTemplate] = useState<Template | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplate() {
      if (!id) return;
      try {
        const response = await fetchWithAuth(`/api/templates/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch template");
        }
        const data = await response.json();
        setTemplate(data);
        setAnswers(
          Object.fromEntries(data.questions.map((q: Question) => [q.id, ""]))
        );
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

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetchWithAuth("/api/submissions/create", {
        method: "POST",
        body: JSON.stringify({
          templateId: template?.id,
          answers: Object.values(answers),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      router.push(`/templates/${id}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setSubmitting(false);
    }
  };

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
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{template.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {template.questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <Label htmlFor={question.id}>
                  {question.title}
                  {question.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                {question.description && (
                  <p className="text-sm text-gray-500">
                    {question.description}
                  </p>
                )}
                {question.type === "short-text" && (
                  <Input
                    id={question.id}
                    value={answers[question.id]}
                    onChange={(e) =>
                      handleInputChange(question.id, e.target.value)
                    }
                    required={question.required}
                  />
                )}
                {question.type === "long-text" && (
                  <Textarea
                    id={question.id}
                    value={answers[question.id]}
                    onChange={(e) =>
                      handleInputChange(question.id, e.target.value)
                    }
                    required={question.required}
                  />
                )}
                {question.type === "number" && (
                  <Input
                    id={question.id}
                    type="number"
                    value={answers[question.id]}
                    onChange={(e) =>
                      handleInputChange(question.id, e.target.value)
                    }
                    required={question.required}
                  />
                )}
                {question.type === "checkbox" && (
                  <Checkbox
                    id={question.id}
                    checked={answers[question.id] === "true"}
                    onCheckedChange={(checked) =>
                      handleInputChange(question.id, checked ? "true" : "false")
                    }
                    required={question.required}
                  />
                )}
              </div>
            ))}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
}

export default function SubmitForm() {
  return (
    <ProtectedRoute>
      <SubmitFormPage />
    </ProtectedRoute>
  );
}
