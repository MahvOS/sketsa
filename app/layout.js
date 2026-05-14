import "./globals.css";

export const metadata = {
  title: "Sketsaa IDN - By Mahv",
  description:
    "abcd😂",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
