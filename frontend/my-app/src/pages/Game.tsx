import { useState } from "react";
import BackButton from "../components/BackButton";
import Chat, { ChatMessage } from "../components/Chat";
import ChessBoardComponent from "../components/ChessBoard";
import { GameConfig, GameConfigProvider } from "../providers/GameConfigProvider";
import Timer from "../components/Timer";
import MoveHistory from "../components/MoveHistory";
import Preferences from "./Prefs";
import { Overlay } from "../components/Overlay";
import GameRightPanel from "../components/GameRightPanel";
import { ChessBoard } from "../engine/ChessBoardLogic";

export const GlobalBoard: ChessBoard = new ChessBoard("SP");

export default function Game({ gameConfig }: { gameConfig: GameConfig }) {

  const [showPreferences, setShowPreferences] = useState(false);

  const [chat, setChat] = useState<ChatMessage[]>(
    [
      { name: "Opponent", message: "Hello!" },
      { name: "You", message: "Hi there!" },
    ]
  );

  return (
    <div style={{ userSelect: "none", WebkitUserSelect: "none", msUserSelect: "none", display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>

      <button
        onClick={() => setShowPreferences(true)}
        style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 1000 }}
      >
        Preferences
      </button>
      {(
        <Overlay show={showPreferences} onClose={() => setShowPreferences(false)}>
          <Preferences/>
        </Overlay>
      )}
      <GameConfigProvider value={gameConfig}>
        <ChessBoardComponent />
        <GameRightPanel/>
      </GameConfigProvider>
    </div >
  );
}