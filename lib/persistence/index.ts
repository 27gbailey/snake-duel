/** Repository abstraction entry point — swap implementation for PostgreSQL later. */
export {
  clearSave,
  createSavePayload,
  IndexedDbSaveRepository,
  loadGame,
  LocalSaveRepository,
  persistGame,
  type SaveRepository,
} from "@/features/game/engines/saveLoadSystem";
