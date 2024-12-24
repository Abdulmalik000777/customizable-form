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
  const router = useRouter();

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetchWithAuth("/api/templates");
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
        if (error instanceof Error && error.message.includes("Unauthorized")) {
          logout();
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [logout, router]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Templates
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create and manage your form templates
            </p>
          </div>
          <Button asChild className="h-10">
            <Link href="/templates/create">
              <Plus className="w-5 h-5 mr-2" />
              Create Template
            </Link>
          </Button>
        </div>

        {templates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                No templates yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Create your first template to get started
              </p>
              <Button asChild>
                <Link href="/templates/create">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Template
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
                    {template.description || "No description provided"}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(template.createdAt).toLocaleDateString()} •{" "}
                      {template._count.questions} questions
                    </span>
                    <Button variant="outline" asChild>
                      <Link href={`/templates/${template.id}`}>
                        View Template
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
