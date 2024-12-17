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
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { fetchWithAuth } from "../../../utils/api";
import { ProtectedRoute } from "../../../components/protected-route";
import Link from "next/link";

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

function SubmissionsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterQuestion, setFilterQuestion] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSubmissions() {
      if (!id) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
          sortBy,
          sortOrder,
          ...(filterQuestion && { filterQuestion }),
          ...(filterValue && { filterValue }),
        });
        const response = await fetchWithAuth(
          `/api/templates/${id}/submissions?${queryParams}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch submissions");
        }
        const data = await response.json();
        setSubmissions(data.submissions);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        if (data.submissions.length > 0) {
          setQuestions(
            data.submissions[0].answers.map(
              (answer: Answer) => answer.question.title
            )
          );
        }
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
  }, [id, currentPage, sortBy, sortOrder, filterQuestion, filterValue]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
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
          <h1 className="text-3xl font-bold">Submissions</h1>
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
          <Card>
            <CardHeader>
              <CardTitle>All Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFilter} className="mb-4 flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="filterQuestion">Filter by Question</Label>
                  <Select
                    value={filterQuestion}
                    onValueChange={setFilterQuestion}
                  >
                    <SelectTrigger id="filterQuestion">
                      <SelectValue placeholder="Select a question" />
                    </SelectTrigger>
                    <SelectContent>
                      {questions.map((question) => (
                        <SelectItem key={question} value={question}>
                          {question}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="filterValue">Filter Value</Label>
                  <Input
                    id="filterValue"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder="Enter filter value"
                  />
                </div>
                <Button type="submit" className="mt-auto">
                  Apply Filter
                </Button>
              </form>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("createdAt")}
                      >
                        Submission Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    {submissions[0].answers.map((answer) => (
                      <TableHead key={answer.question.id}>
                        {answer.question.title}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        {new Date(submission.createdAt).toLocaleString()}
                      </TableCell>
                      {submission.answers.map((answer) => (
                        <TableCell key={answer.id}>{answer.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-between items-center">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default function Submissions() {
  return (
    <ProtectedRoute>
      <SubmissionsPage />
    </ProtectedRoute>
  );
}
