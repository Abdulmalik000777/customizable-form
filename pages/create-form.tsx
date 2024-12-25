import { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

type QuestionType = {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  regex?: string;
};

export default function CreateForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addQuestion = () => {
    const newQuestion: QuestionType = {
      id: Math.random().toString(36).substr(2, 9),
      type: "text",
      title: "",
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<QuestionType>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (status !== "authenticated") {
      setError("You must be signed in to create a form");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/templates/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          questions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create template");
      }

      router.push("/my-forms");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Form Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="space-y-2">
                  <Input
                    value={question.title}
                    onChange={(e) =>
                      updateQuestion(question.id, { title: e.target.value })
                    }
                    placeholder="Question Title"
                  />
                  <Textarea
                    value={question.description || ""}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        description: e.target.value,
                      })
                    }
                    placeholder="Question Description"
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`required-${question.id}`}
                      checked={question.required}
                      onCheckedChange={(checked) =>
                        updateQuestion(question.id, {
                          required: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor={`required-${question.id}`}>Required</Label>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    variant="destructive"
                  >
                    Remove Question
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button type="button" onClick={addQuestion}>
              Add Question
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Form"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
