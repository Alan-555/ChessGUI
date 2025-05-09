import ChessBoardComponent from "../components/ChessBoard";
import { GameConfigProvider } from "../providers/GameConfigProvider";

export default function Game() {
  return (
    <div style={{ userSelect:"none", WebkitUserSelect:"none", msUserSelect:"none", display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <GameConfigProvider>
        <ChessBoardComponent/>
      </GameConfigProvider>
    </div >
  );
}