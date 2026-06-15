import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page">
      <div className="page__header">
        <h1 className="page__title">Page not found</h1>
        <p className="page__subtitle">
          This URL does not exist. Open the Snake.IO arena from the link below.
        </p>
        <p className="page__subtitle">
          <Link href="/">Play Snake.IO</Link>
        </p>
      </div>
    </main>
  );
}
