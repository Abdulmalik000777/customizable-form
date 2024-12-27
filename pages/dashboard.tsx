import React from "react";
import Layout from "../components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

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
              <p>{t("dashboard.totalForms")}: 0</p>
              <p>{t("dashboard.totalSubmissions")}: 0</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
