import BackButton from "../components/BackButton";
import ChessBoardComponent from "../components/ChessBoard";
import { GameConfig, GameConfigProvider } from "../providers/GameConfigProvider";

export default function Game({gameConfig}:{gameConfig: GameConfig}) {
  return (
    <div style={{ userSelect:"none", WebkitUserSelect:"none", msUserSelect:"none", display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <GameConfigProvider value={gameConfig}>
        <ChessBoardComponent/>
      </GameConfigProvider>
    </div >
  );
}