import "./global.css"

export const metadata = {
  title: "LOTR RAG Chatbot",
  description: "A RAG chatbot powered by Lord of the Rings knowledge",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">{children}</div>
      </body>
    </html>
  );
}
