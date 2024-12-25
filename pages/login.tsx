import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { useTranslation } from "react-i18next";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslation("common");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("auth.loginError"));
      }

      const { token } = data;
      login(token);
      router.push("/templates");
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : t("auth.loginError"));
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">{t("auth.loginTitle")}</h1>
        {router.query.registered === "true" && (
          <Alert
            variant="default"
            className="mb-4 bg-green-100 border-green-400 text-green-700"
          >
            <AlertCircle className="h-4 w-4 text-green-400" />
            <AlertTitle>{t("common.success")}</AlertTitle>
            <AlertDescription>{t("auth.registerSuccess")}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("common.error")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">{t("auth.emailPlaceholder")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">{t("auth.passwordPlaceholder")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full">
            {t("auth.loginButton")}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
