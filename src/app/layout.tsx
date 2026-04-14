import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trinca CRM",
  description: "CRM de prospecção — Trinca do iGaming",
  robots: { index: false, follow: false },
  icons: {
    icon: [
      {
        url: "https://i.ibb.co/DHfTRTh4/favicon.png",
        type: "image/png",
      },
    ],
    shortcut: "https://i.ibb.co/DHfTRTh4/favicon.png",
    apple: "https://i.ibb.co/DHfTRTh4/favicon.png",
  },
};

/**
 * Inline script that reads theme from localStorage and applies the
 * correct class on <html> BEFORE React hydrates — this avoids the
 * "flash of wrong theme" on first paint.
 */
const THEME_INIT_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('trinca.theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark');
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
