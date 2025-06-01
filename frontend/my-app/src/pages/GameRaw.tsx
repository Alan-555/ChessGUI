import ChessBoardComponent from "../components/ChessBoard";
import { GameConfig, GameConfigProvider } from "../providers/GameConfigProvider";

export default function GameRaw({gameConfig}:{gameConfig: GameConfig}) {
  return (
    <div style={{ userSelect:"none", WebkitUserSelect:"none", msUserSelect:"none", display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '70px'}}>
      <GameConfigProvider value={gameConfig}>
        <ChessBoardComponent/>
      </GameConfigProvider>
    </div >
  );
}