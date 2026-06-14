import SnakeGame from "@/components/SnakeGame";

export default function Home() {
  return (
    <main className="page">
      <div className="page__header">
        <h1 className="page__title">Snake Duel</h1>
        <p className="page__subtitle">
          Eat fruit and turrets, dodge bullets — play solo or co-op on one keyboard.
        </p>
      </div>
      <SnakeGame />
    </main>
  );
}
