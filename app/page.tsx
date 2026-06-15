import SnakeGame from "@/components/SnakeGame";

export default function Home() {
  return (
    <main className="page">
      <div className="page__header">
        <h1 className="page__title">Snake.IO</h1>
        <p className="page__subtitle">
          One-player arena snake — steer with the arrow keys, move forward nonstop, and trap rival snakes to steal their points.
        </p>
      </div>
      <SnakeGame />
    </main>
  );
}
