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
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface QuestionData {
  questionId: string;
  title: string;
  type: string;
  data: any;
}

interface AnalyticsData {
  totalSubmissions: number;
  questionData: QuestionData[];
}

function DashboardPage() {
  const router = useRouter();
  const { id } = router.query;
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!id) return;
      setLoading(true);
      try {
        const response = await fetchWithAuth(`/api/templates/${id}/analytics`);
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !analyticsData) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Failed to load analytics"}
          </AlertDescription>
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {analyticsData.totalSubmissions}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analyticsData.questionData.map((question) => (
            <Card key={question.questionId}>
              <CardHeader>
                <CardTitle>{question.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {question.type === "number" ? (
                  <Bar
                    data={{
                      labels: ["Average", "Min", "Max"],
                      datasets: [
                        {
                          label: "Value",
                          data: [
                            question.data.average,
                            question.data.min,
                            question.data.max,
                          ],
                          backgroundColor: [
                            "rgba(75, 192, 192, 0.6)",
                            "rgba(255, 99, 132, 0.6)",
                            "rgba(54, 162, 235, 0.6)",
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                        title: {
                          display: true,
                          text: "Numeric Response Statistics",
                        },
                      },
                    }}
                  />
                ) : (
                  <Pie
                    data={{
                      labels: question.data.map((item: any) => item.value),
                      datasets: [
                        {
                          data: question.data.map((item: any) => item.count),
                          backgroundColor: [
                            "rgba(255, 99, 132, 0.6)",
                            "rgba(54, 162, 235, 0.6)",
                            "rgba(255, 206, 86, 0.6)",
                            "rgba(75, 192, 192, 0.6)",
                            "rgba(153, 102, 255, 0.6)",
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                        title: {
                          display: true,
                          text: "Response Distribution",
                        },
                      },
                    }}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
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
