import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/auth-context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }

      const { token } = await response.json();
      login(token);
      router.push("/templates");
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        {router.query.registered === "true" && (
          <Alert
            variant="default"
            className="mb-4 bg-green-100 border-green-400 text-green-700"
          >
            <AlertCircle className="h-4 w-4 text-green-400" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Registration successful. Please log in with your new account.
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Password</Label>
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
            Login
          </Button>
        </form>
      </div>
    </Layout>
  );
}
