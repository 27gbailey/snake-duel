import BlockyBackground from "@/components/BlockyBackground";
import MenuButton from "@/components/MenuButton";

export default function PlayScreen() {
  return (
    <main className="scene-screen play-screen">
      <BlockyBackground />
      <div className="play-screen__ui">
        <MenuButton />
      </div>
    </main>
  );
}
