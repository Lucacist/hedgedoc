import "./globals.css";

export const metadata = {
  title: "HedgeDoc Collaborative",
  description: "Application collaborative d'édition Markdown en temps réel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}
