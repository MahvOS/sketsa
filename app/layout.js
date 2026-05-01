import "./globals.css";

export const metadata = {
  title: "Sketsaa IDN",
  description:
    "Tahfidz anying.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
