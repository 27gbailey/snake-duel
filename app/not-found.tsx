import Link from "next/link";

export default function NotFound() {
  return (
    <main className="screen screen--menu">
      <div className="menu-hero">
        <h1 className="menu-hero__title">Page not found</h1>
        <p className="menu-hero__subtitle">
          This page does not exist. Head back to your restaurant.
        </p>
        <p className="menu-hero__subtitle">
          <Link href="/">Open Slice &amp; Serve</Link>
        </p>
      </div>
    </main>
  );
}
