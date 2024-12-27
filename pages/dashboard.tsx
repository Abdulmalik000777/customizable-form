import React from "react";
import Layout from "../components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation("common");

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">
          {t("dashboard.title", "Dashboard")}
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("dashboard.recentForms", "Recent Forms")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t("dashboard.noRecentForms", "No recent forms")}</p>
              <Button asChild className="mt-4">
                <Link href="/templates">
                  {t("dashboard.viewAllForms", "View All Forms")}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t("dashboard.quickActions", "Quick Actions")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full mb-2">
                <Link href="/templates/create">
                  {t("dashboard.createNewForm", "Create New Form")}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/templates">
                  {t("dashboard.manageTemplates", "Manage Templates")}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.stats", "Stats")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t("dashboard.totalForms", "Total Forms")}: 0</p>
              <p>{t("dashboard.totalSubmissions", "Total Submissions")}: 0</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
