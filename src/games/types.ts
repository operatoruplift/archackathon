export interface GameProps {
  /** Called exactly once when the run ends; the shell owns everything after. */
  onGameOver: (score: number) => void;
}
