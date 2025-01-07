import { useState } from "react";
import { GetServerSideProps } from "next";
import { PrismaClient } from "@prisma/client";
import { useRouter } from "next/router";
import Layout from "../../components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Edit,
  Trash2,
  FileText,
  Eye,
  BarChart2,
  ArrowLeft,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import Link from "next/link";
import { fetchWithAuth } from "../../utils/api";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { t } = useTranslation("common");

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetchWithAuth(`/api/templates/${template?.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      router.push("/templates");
    } catch (error) {
      console.error("Error deleting template:", error);
      setDeleteError("An error occurred while deleting the template");
    } finally {
      setIsDeleting(false);
    }
  };

  if (error || !template) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || "Template not found"}</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground w-full bg-background/50 hover:bg-accent/30 hover:scale-105 hover:-rotate-1 border-accent/20 transition-all duration-300 shadow-md hover:shadow-xl hover:border-accent/50"
            >
              <Link href="/templates" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Templates</span>
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="w-full bg-background/50 hover:bg-accent/30 hover:scale-105 hover:-rotate-1 border-accent/20 transition-all duration-300 shadow-md hover:shadow-xl hover:border-accent/50"
            >
              <Link
                href={`/templates/${template.id}/edit`}
                className="flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Template</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="w-full bg-background/50 hover:bg-accent/30 hover:scale-105 hover:-rotate-1 border-accent/20 transition-all duration-300 shadow-md hover:shadow-xl hover:border-accent/50"
            >
              <Link
                href={`/templates/${template.id}/submit`}
                className="flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Fill Out Form</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="w-full bg-background/50 hover:bg-accent/30 hover:scale-105 hover:-rotate-1 border-accent/20 transition-all duration-300 shadow-md hover:shadow-xl hover:border-accent/50"
            >
              <Link
                href={`/templates/${template.id}/submissions`}
                className="flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Submissions</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="w-full bg-background/50 hover:bg-accent/30 hover:scale-105 hover:-rotate-1 border-accent/20 transition-all duration-300 shadow-md hover:shadow-xl hover:border-accent/50"
            >
              <Link
                href={`/templates/${template.id}/dashboard`}
                className="flex items-center justify-center gap-2"
              >
                <BarChart2 className="w-4 h-4" />
                <span>View Responses</span>
              </Link>
            </Button>
          </div>
          <div className="mt-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full hover:scale-105 hover:-rotate-1 transition-all duration-300 shadow-md hover:shadow-xl bg-destructive hover:bg-destructive/90"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span>Delete Template</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your template and all of its data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card className="mt-8 mb-8 border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-3xl">{template.title}</CardTitle>
            {template.description && (
              <CardDescription className="text-lg">
                {template.description}
              </CardDescription>
            )}
          </CardHeader>
        </Card>

        {deleteError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Questions</h2>
          {template.questions.length === 0 ? (
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">No questions added yet.</p>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="mt-4 bg-background/50 hover:bg-accent/30 hover:scale-105 hover:-rotate-1 border-accent/20 transition-all duration-300 shadow-md hover:shadow-xl hover:border-accent/50"
                >
                  <Link href={`/templates/${template.id}/edit`}>
                    Add Questions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            template.questions.map((question, index) => (
              <Card
                key={question.id}
                className="transition-all duration-300 border-accent/20 bg-accent/5 hover:bg-accent/20 hover:border-accent/50 hover:scale-[1.02] hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span>{index + 1}.</span> {question.title}
                    {question.required && (
                      <span className="text-destructive text-sm">Required</span>
                    )}
                  </CardTitle>
                  {question.description && (
                    <CardDescription>{question.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Type: {question.type.replace("-", " ")}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
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
