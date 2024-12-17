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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { fetchWithAuth } from "../../../utils/api";
import { ProtectedRoute } from "../../../components/protected-route";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Answer {
  id: string;
  value: string;
  question: {
    id: string;
    title: string;
    type: string;
  };
}

interface Submission {
  id: string;
  createdAt: string;
  answers: Answer[];
}

function DashboardPage() {
  const router = useRouter();
  const { id } = router.query;
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubmissions() {
      if (!id) return;
      setLoading(true);
      try {
        const response = await fetchWithAuth(
          `/api/templates/${id}/submissions?limit=1000`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch submissions");
        }
        const data = await response.json();
        setSubmissions(data.submissions);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, [id]);

  const prepareChartData = (questionTitle: string) => {
    const answerCounts: { [key: string]: number } = {};
    submissions.forEach((submission) => {
      const answer = submission.answers.find(
        (a) => a.question.title === questionTitle
      );
      if (answer) {
        answerCounts[answer.value] = (answerCounts[answer.value] || 0) + 1;
      }
    });

    return {
      labels: Object.keys(answerCounts),
      datasets: [
        {
          label: questionTitle,
          data: Object.values(answerCounts),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
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

  if (error) {
    return (
      <Layout>
        <Alert variant="destructive">
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
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button variant="outline" asChild>
            <Link href={`/templates/${id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Template
            </Link>
          </Button>
        </div>

        {submissions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <h3 className="text-xl font-semibold mb-2 text-center">
                No submissions yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                There are no submissions for this template yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {submissions[0].answers.map((answer) => (
              <Card key={answer.question.id}>
                <CardHeader>
                  <CardTitle>{answer.question.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Bar data={prepareChartData(answer.question.title)} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
