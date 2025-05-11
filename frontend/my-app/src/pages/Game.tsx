import { useState } from "react";
import BackButton from "../components/BackButton";
import Chat, { ChatMessage } from "../components/Chat";
import ChessBoardComponent from "../components/ChessBoard";
import { GameConfig, GameConfigProvider } from "../providers/GameConfigProvider";
import Timer from "../components/Timer";
import MoveHistory from "../components/MoveHistory";

export default function Game({ gameConfig }: { gameConfig: GameConfig }) {
  const [chat, setChat] = useState<ChatMessage[]>(
    [
      { name: "Opponent", message: "Hello!" },
      { name: "You", message: "Hi there!" },
      
    ]
  );
  return (
    <div style={{ userSelect: "none", WebkitUserSelect: "none", msUserSelect: "none", display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <GameConfigProvider value={gameConfig}>
        <ChessBoardComponent />
        <div style={{marginLeft:'2vw'}}>
          <div style={{minHeight:'33vh',maxWidth:'auto',  height:'33vh',maxHeight:'33vh', width:'20vw'}}>
            <Chat messages={chat} onSendMessage={(message) => {
              setChat((prev) => [...prev, { name: "You", message }]);
            }} />
          </div>
          <div style={{ borderTop: '1px solid black', margin: '1rem 0' }}></div>
          <div>
            <Timer activeTimer={true} timeBlack={120} timeWhite={120}/>
          </div>
          <div style={{ borderTop: '1px solid black', margin: '1rem 0' }}></div>
          <div>
            <MoveHistory moves={
              [
                { white: "e4", black: "e5" },
                { white: "Nf3", black: "Nc6" },
                { white: "Bb5", black: "a6" },
                { white: "Ba4", black: "Nf6" },
                { white: "O-O", black: "Be7" },
                { white: "O-O", black: "Be7" },
                { white: "O-O", black: "Be7" },
                { white: "O-O", black: "Be7" },
                { white: "O-O", black: "Be7" },
                { white: "O-O", black: "Be7" },
              ]
            } onNext={()=>{}} onPrevious={()=>{}} showNavigationButtons={true} />
          </div>
        </div>
      </GameConfigProvider>
    </div >
  );
}