import { GetServerSideProps } from "next";
import { PrismaClient } from "@prisma/client";
import Layout from "../../components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

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

  if (!template) {
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{template.title}</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {template.description}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Questions</h2>
          {template.questions.map((question) => (
            <Card key={question.id} className="mb-4">
              <CardHeader>
                <CardTitle className="text-xl">
                  {question.title}
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

        <div className="flex justify-end space-x-4">
          <Button variant="outline">Edit Template</Button>
          <Button variant="destructive">Delete Template</Button>
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
