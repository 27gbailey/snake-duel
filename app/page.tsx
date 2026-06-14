import SnakeGame from "@/components/SnakeGame";

export default function Home() {
  return (
    <main className="page">
      <div className="page__header">
        <h1 className="page__title">Snake Duel</h1>
        <p className="page__subtitle">
          Two-player snake on a shared keyboard — last snake standing wins.
        </p>
      </div>
      <SnakeGame />
    </main>
  );
}
