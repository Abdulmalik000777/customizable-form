import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../contexts/auth-context";
import { LanguageProvider } from "../contexts/language-context";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";

// Add this error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Uncaught error:", error.error);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ErrorBoundary>
            <Component {...pageProps} key={router.locale || "default"} />
          </ErrorBoundary>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
