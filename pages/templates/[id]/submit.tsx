import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { fetchWithAuth } from "../../../utils/api";
import { ProtectedRoute } from "../../../components/protected-route";
import { Progress } from "../../../components/ui/progress";

interface Question {
  id: string;
  type: string;
  title: string;
  description: string | null;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  regex?: string;
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

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
    validateField(questionId, value);
  };

  const validateField = (questionId: string, value: string) => {
    const question = template?.questions.find((q) => q.id === questionId);
    if (!question) return;

    let error = "";

    if (question.required && (!value || value.trim() === "")) {
      error = "This field is required";
    } else if (question.type === "number") {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        error = "Must be a number";
      } else {
        if (question.minValue !== undefined && numValue < question.minValue) {
          error = `Must be at least ${question.minValue}`;
        }
        if (question.maxValue !== undefined && numValue > question.maxValue) {
          error = `Must be at most ${question.maxValue}`;
        }
      }
    } else if (
      question.type === "short-text" ||
      question.type === "long-text"
    ) {
      if (question.minLength && value.length < question.minLength) {
        error = `Must be at least ${question.minLength} characters long`;
      }
      if (question.maxLength && value.length > question.maxLength) {
        error = `Must be at most ${question.maxLength} characters long`;
      }
      if (question.regex) {
        const regex = new RegExp(question.regex);
        if (!regex.test(value)) {
          error = "Does not match the required format";
        }
      }
    }

    setErrors((prev) => ({ ...prev, [questionId]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validate all fields before submission
    template?.questions.forEach((question) => {
      validateField(question.id, answers[question.id]);
    });

    if (Object.values(errors).some((error) => error !== "")) {
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetchWithAuth("/api/submissions/create", {
        method: "POST",
        body: JSON.stringify({
          templateId: template?.id,
          answers: Object.values(answers),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit form");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/templates/${id}`);
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < (template?.questions.length || 0) - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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

  const currentQuestion = template.questions[currentStep];
  const progress = ((currentStep + 1) / template.questions.length) * 100;

  return (
    <Layout>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{template.title}</CardTitle>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div key={currentQuestion.id} className="space-y-2">
              <Label htmlFor={currentQuestion.id}>
                {currentQuestion.title}
                {currentQuestion.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              {currentQuestion.description && (
                <p className="text-sm text-gray-500">
                  {currentQuestion.description}
                </p>
              )}
              {currentQuestion.type === "short-text" && (
                <Input
                  id={currentQuestion.id}
                  value={answers[currentQuestion.id]}
                  onChange={(e) =>
                    handleInputChange(currentQuestion.id, e.target.value)
                  }
                  required={currentQuestion.required}
                />
              )}
              {currentQuestion.type === "long-text" && (
                <Textarea
                  id={currentQuestion.id}
                  value={answers[currentQuestion.id]}
                  onChange={(e) =>
                    handleInputChange(currentQuestion.id, e.target.value)
                  }
                  required={currentQuestion.required}
                />
              )}
              {currentQuestion.type === "number" && (
                <Input
                  id={currentQuestion.id}
                  type="number"
                  value={answers[currentQuestion.id]}
                  onChange={(e) =>
                    handleInputChange(currentQuestion.id, e.target.value)
                  }
                  required={currentQuestion.required}
                  min={currentQuestion.minValue}
                  max={currentQuestion.maxValue}
                />
              )}
              {currentQuestion.type === "checkbox" && (
                <Checkbox
                  id={currentQuestion.id}
                  checked={answers[currentQuestion.id] === "true"}
                  onCheckedChange={(checked) =>
                    handleInputChange(
                      currentQuestion.id,
                      checked ? "true" : "false"
                    )
                  }
                  required={currentQuestion.required}
                />
              )}
              {errors[currentQuestion.id] && (
                <p className="text-sm text-red-500">
                  {errors[currentQuestion.id]}
                </p>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={prevStep} disabled={currentStep === 0}>
            Previous
          </Button>
          {currentStep === template.questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          ) : (
            <Button onClick={nextStep}>Next</Button>
          )}
        </CardFooter>
      </Card>
      {success && (
        <Alert
          variant="default"
          className="mt-4 bg-green-100 border-green-400 text-green-700"
        >
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Your form has been submitted successfully!
          </AlertDescription>
        </Alert>
      )}
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
