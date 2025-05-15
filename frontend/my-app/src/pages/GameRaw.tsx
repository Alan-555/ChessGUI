import BackButton from "../components/BackButton";
import Chat from "../components/Chat";
import ChessBoardComponent from "../components/ChessBoard";
import { ChessBoard } from "../engine/ChessBoardLogic";
import { GameConfig, GameConfigProvider } from "../providers/GameConfigProvider";
import { GlobalBoard } from "./Game";

export default function GameRaw({gameConfig}:{gameConfig: GameConfig}) {
  return (
    <div style={{ userSelect:"none", WebkitUserSelect:"none", msUserSelect:"none", display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <GameConfigProvider value={gameConfig}>
        <ChessBoardComponent/>
      </GameConfigProvider>
    </div >
  );
}