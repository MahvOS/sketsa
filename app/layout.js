import "./globals.css";

export const metadata = {
  title: "Sketsaa IDN",
  description:
    "Aplikasi pembantu hafalan Al-Quran modern untuk persiapan UAS Tahfidz.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
