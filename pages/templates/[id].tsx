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
import {
  AlertCircle,
  Edit,
  Trash2,
  FileText,
  List,
  BarChart2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
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
} from "../../components/ui/alert-dialog";
import Link from "next/link";
import { fetchWithAuth } from "../../utils/api";
import { GetServerSideProps } from "next";
import { PrismaClient } from "@prisma/client";

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
  createdAt: string;
  questions: Question[];
}

interface TemplateProps {
  template: Template | null;
  error: string | null;
}

export default function TemplatePage({ template, error }: TemplateProps) {
  const router = useRouter();
  const { id } = router.query;
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [templateState, setTemplate] = useState<Template | null>(null);
  const [fetchError, setError] = useState<string | null>(null);

  const fetchTemplate = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`/api/templates/${id}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (response.status === 404) {
          throw new Error("Template not found");
        }
        throw new Error("Failed to fetch template");
      }
      const data = await response.json();
      setTemplate(data);
    } catch (error) {
      console.error("Error fetching template:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTemplate();
    }
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetchWithAuth(
        `/api/templates/${templateState?.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete template");
      }

      router.push("/templates");
    } catch (error) {
      console.error("Error deleting template:", error);
      setDeleteError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting the template. Please try again."
      );
      // Add a retry mechanism
      setTimeout(() => {
        setDeleteError(null);
        setIsDeleting(false);
      }, 5000); // Allow retry after 5 seconds
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (!templateState && !loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Template not found</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {templateState ? (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {templateState?.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {templateState?.description}
                </p>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/templates/${templateState?.id}/edit`)
                  }
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/templates/${templateState?.id}/submit`}>
                    <FileText className="w-4 h-4 mr-2" />
                    Fill Out Form
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/templates/${templateState?.id}/submissions`}>
                    <List className="w-4 h-4 mr-2" />
                    View Submissions
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/templates/${templateState?.id}/dashboard`}>
                    <BarChart2 className="w-4 h-4 mr-2" />
                    View Dashboard
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deleteError ? "Retry Delete" : "Delete"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the template and all associated questions and
                        submissions.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {deleteError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{deleteError}</AlertDescription>
              </Alert>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Questions</h2>
              {templateState?.questions.map((question, index) => (
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
            </div>

            <div className="mt-8">
              <Button asChild>
                <Link href="/templates">Back to Templates</Link>
              </Button>
            </div>
          </>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Template not found</AlertDescription>
          </Alert>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  const prisma = new PrismaClient();

  try {
    const template = await prisma.template.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!template) {
      return { props: { template: null, error: "Template not found" } };
    }

    return {
      props: {
        template: JSON.parse(JSON.stringify(template)),
        error: null,
      },
    };
  } catch (error) {
    console.error("Error fetching template:", error);
    return {
      props: {
        template: null,
        error: "An error occurred while fetching the template",
      },
    };
  } finally {
    await prisma.$disconnect();
  }
};
