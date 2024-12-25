import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../contexts/auth-context";
import { LanguageProvider } from "../contexts/language-context";
import "../styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Component {...pageProps} />
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
