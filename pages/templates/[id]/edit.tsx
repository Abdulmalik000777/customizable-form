import React, { useState, useEffect, forwardRef } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { ButtonProps, buttonVariants } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";
import {
  PlusCircle,
  Type,
  AlignLeft,
  Hash,
  ToggleLeft,
  AlertCircle,
  Save,
} from "lucide-react";
import { fetchWithAuth } from "../../../utils/api";
import { cn } from "../../../utils/cn";
import Slot from "../../../components/ui/slot";

type QuestionType = "short-text" | "long-text" | "number" | "checkbox";

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
}

interface Template {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function EditTemplate() {
  const router = useRouter();
  const { id } = router.query;
  const [template, setTemplate] = useState<Template | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    try {
      const response = await fetchWithAuth(`/api/templates/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch template");
      }
      const data = await response.json();
      setTemplate(data);
      setTitle(data.title);
      setDescription(data.description);
      setQuestions(data.questions);
    } catch (error) {
      console.error("Error fetching template:", error);
      setError("Failed to load template");
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      title: "",
      description: "",
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetchWithAuth(`/api/templates/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, questions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update template");
      }

      router.push(`/templates/${id}`);
    } catch (error) {
      console.error("Error updating template:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Loading template...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Edit Template</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Template Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Enter template title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Enter template description"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Questions</h2>
                {questions.map((question) => (
                  <Card key={question.id} className="p-4">
                    <div className="space-y-4">
                      <Input
                        value={question.title}
                        onChange={(e) =>
                          updateQuestion(question.id, { title: e.target.value })
                        }
                        placeholder="Question Title"
                        className="mb-2"
                      />
                      <Textarea
                        value={question.description}
                        onChange={(e) =>
                          updateQuestion(question.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Question Description"
                        rows={2}
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`required-${question.id}`}
                          checked={question.required}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              required: e.target.checked,
                            })
                          }
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`required-${question.id}`}>
                          Required
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeQuestion(question.id)}
                      >
                        Remove Question
                      </Button>
                    </div>
                  </Card>
                ))}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addQuestion("short-text")}
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Add Short Text
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addQuestion("long-text")}
                  >
                    <AlignLeft className="w-4 h-4 mr-2" />
                    Add Long Text
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addQuestion("number")}
                  >
                    <Hash className="w-4 h-4 mr-2" />
                    Add Number
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addQuestion("checkbox")}
                  >
                    <ToggleLeft className="w-4 h-4 mr-2" />
                    Add Checkbox
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Updating Template...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Template
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
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
