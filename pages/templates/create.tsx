import React, { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { ButtonProps, buttonVariants } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import {
  PlusCircle,
  Type,
  AlignLeft,
  Hash,
  ToggleLeft,
  AlertCircle,
} from "lucide-react";
import { fetchWithAuth } from "../../utils/api";
import { cn } from "../../utils/cn";
import Slot from "../../components/ui/slot";

type QuestionType = "short-text" | "long-text" | "number" | "checkbox";

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
}

export default function CreateTemplate() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetchWithAuth("/api/templates/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, questions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create template");
      }

      router.push("/templates");
    } catch (error) {
      console.error("Error creating template:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create New Template</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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
                  <Card key={question.id} className="mb-4">
                    <CardContent>
                      <div className="space-y-4">
                        <Input
                          value={question.title}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              title: e.target.value,
                            })
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
                          size="sm"
                          onClick={() => deleteQuestion(question.id)}
                        >
                          Remove Question
                        </Button>
                      </div>
                    </CardContent>
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
                    <PlusCircle className="w-4 h-4 mr-2 animate-spin" />
                    Creating Template...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Template
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
