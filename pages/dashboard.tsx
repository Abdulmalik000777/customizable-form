import React, { useEffect, useState } from "react";
import Layout from "../components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { fetchWithAuth } from "../utils/api";

interface DashboardStats {
  totalForms: number;
  totalSubmissions: number;
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    totalSubmissions: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetchWithAuth("/api/templates/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="space-y-6" key={`dashboard-${language}`}>
        <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.recentForms")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t("dashboard.noRecentForms")}</p>
              <Button asChild className="mt-4">
                <Link href="/templates">{t("dashboard.viewAllForms")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.quickActions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full mb-2">
                <Link href="/templates/create">
                  {t("dashboard.createNewForm")}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/templates">{t("dashboard.manageTemplates")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.stats")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{`${t("dashboard.totalForms")}: ${stats.totalForms}`}</p>
              <p>{`${t("dashboard.totalSubmissions")}: ${
                stats.totalSubmissions
              }`}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
