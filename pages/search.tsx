import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Layout from "../components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { fetchWithAuth } from "../utils/api";

interface Template {
  id: string;
  title: string;
  description: string;
}

export default function SearchResults() {
  const router = useRouter();
  const { q } = router.query;
  const [results, setResults] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation("common");

  useEffect(() => {
    if (q && typeof q === "string") {
      fetchResults();
    }
  }, [q]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `/api/search?q=${encodeURIComponent(q as string)}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        console.error("Failed to fetch search results");
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">
        {t("search.results", { query: q || "" })}
      </h1>
      {loading ? (
        <p>{t("search.loading")}</p>
      ) : results.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{template.description}</p>
                <Button asChild>
                  <Link href={`/templates/${template.id}`}>
                    {t("forms.view")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>{t("search.noResults")}</p>
      )}
    </Layout>
  );
}
