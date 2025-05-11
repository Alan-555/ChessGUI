import { useState } from "react";
import BackButton from "../components/BackButton";
import Chat, { ChatMessage } from "../components/Chat";
import ChessBoardComponent from "../components/ChessBoard";
import { GameConfig, GameConfigProvider } from "../providers/GameConfigProvider";
import Timer from "../components/Timer";

export default function Game({ gameConfig }: { gameConfig: GameConfig }) {
  const [chat, setChat] = useState<ChatMessage[]>(
    [
      { name: "Alice", message: "Hello!" },
      { name: "Bob", message: "Hi there!" },
      { name: "Alice", message: "How's it going?" },
      { name: "Bob", message: "Good, thanks! How about you?" },
      { name: "Alice", message: "Doing well, just playing some chess." },
    ]
  );
  return (
    <div style={{ userSelect: "none", WebkitUserSelect: "none", msUserSelect: "none", display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <GameConfigProvider value={gameConfig}>
        <ChessBoardComponent />
        <div>
          <div>
            <Chat messages={chat} onSendMessage={(message) => {
              setChat((prev) => [...prev, { name: "You", message }]);
            }} />
          </div>
          <div>
            <Timer activeTimer={true} timeBlack={120} timeWhite={120}/>
          </div>
        </div>
      </GameConfigProvider>
    </div >
  );
}