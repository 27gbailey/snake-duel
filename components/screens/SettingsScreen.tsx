"use client";

import { Button, Panel } from "@/components/ui";
import { useGameStore } from "@/features/game/store/gameStore";

export default function SettingsScreen() {
  const { settings, updateSettings, resetSave, navigate } = useGameStore();

  return (
    <div className="screen screen--settings">
      <Panel title="Settings">
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
          />
          Sound effects
        </label>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={settings.musicEnabled}
            onChange={(e) => updateSettings({ musicEnabled: e.target.checked })}
          />
          Background music
        </label>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
          />
          Reduced motion
        </label>

        <div className="settings-danger">
          <Button
            variant="secondary"
            onClick={() => {
              if (confirm("Reset all progress? This cannot be undone.")) {
                resetSave();
                navigate("menu");
              }
            }}
          >
            Reset Save Data
          </Button>
        </div>

        <Button variant="ghost" onClick={() => navigate("menu")}>
          Back to Menu
        </Button>
      </Panel>
    </div>
  );
}
