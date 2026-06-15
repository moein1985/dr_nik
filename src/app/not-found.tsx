export default function NotFound() {
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
      <h1 style={{ fontSize: "4rem", margin: 0 }}>۴۰۴</h1>
      <p style={{ fontSize: "1.25rem", color: "#555" }}>صفحه مورد نظر پیدا نشد</p>
      <a href="/" style={{ color: "#0c7882", textDecoration: "underline" }}>
        بازگشت به صفحه اصلی
      </a>
    </div>
  );
}
