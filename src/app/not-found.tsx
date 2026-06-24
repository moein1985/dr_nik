import { getDictionary } from "@/i18n/dictionary";

export default function NotFound() {
  const dict = getDictionary("fa");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        fontFamily: "Tahoma, sans-serif",
        textAlign: "center",
        gap: "1rem",
      }}
    >
      <h1 style={{ fontSize: "4rem", margin: 0 }}>{dict.notFound.title}</h1>
      <p style={{ fontSize: "1.25rem", color: "#555" }}>{dict.notFound.message}</p>
      <a href="/" style={{ color: "#0c7882", textDecoration: "underline" }}>
        {dict.notFound.backToHome}
      </a>
    </div>
  );
}
