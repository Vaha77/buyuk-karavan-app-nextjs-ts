import "./globals.css";

export const metadata = {
  title: "Buyuk Karavan",
  description: "Internal system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body>{children}</body>
      
    </html>
  );
}