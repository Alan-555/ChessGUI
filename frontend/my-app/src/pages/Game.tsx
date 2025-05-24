import { useCallback, useEffect, useRef, useState } from "react";
import BackButton from "../components/BackButton";
import Chat from "../components/Chat";
import ChessBoardComponent from "../components/ChessBoard";
import { GameConfig, GameConfigProvider } from "../providers/GameConfigProvider";
import Timer from "../components/Timer";
import MoveHistory from "../components/MoveHistory";
import Preferences from "./Prefs";
import { Overlay } from "../components/Overlay";
import GameRightPanel from "../components/GameRightPanel";
import { ChessBoard, PieceColor } from "../engine/ChessBoardLogic";
import { GameOverData, MessageStateSync, ServerSync } from "../engine/ServerSync";
import GameMessage, { GameMessageProps } from "../components/GameMessage";
import { useNavigate } from "react-router-dom";

export const GlobalBoard: ChessBoard = new ChessBoard("SP");

export default function Game({ gameConfig }: { gameConfig: GameConfig }) {

  const nav = useNavigate();

  const [boardFen, setBoardFen] = useState<string>(gameConfig.startPosition);
  const [gameMessage, setGameMessage] = useState<GameMessageProps>({
    show : false,
    buttonText:"",
    message:"",
    onButtonClick() {
        
    },
    title:""
  });
  const [gameTime, setGameTime] = useState<{ whiteTime: number, blackTime: number } | null>(gameConfig.time === undefined ? null : {
    blackTime: gameConfig.time,
    whiteTime: gameConfig.time
  });
  const [showPreferences, setShowPreferences] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>(
    [
    ]
  );
  const SendChatMessage = (message: string) => {
    const newMessage: ChatMessage = {
      name: "You",
      message: message,
    };
    setChat((prevMessages) => [...prevMessages, newMessage]);
    ServerSync.Instance.SendChatMessage(message);
  }

  const once = useRef(false);

  useEffect(() => {
    console.log("crap alerady prepared? "+once.current);
    if (once.current)
      return;
    once.current = true;
    
    ServerSync.Instance.on<string>("onChat", (m) => {
      setChat((prevMessages) => [...prevMessages, { name: "Opponent", message: m }]);
    });
    ServerSync.Instance.on<MessageStateSync>("onSync", (m) => {
      if (gameTime)
        setGameTime({
          blackTime: m.blackTime,
          whiteTime: m.whiteTime
        });
      GlobalBoard.InitBoard(m.boardFen);
      GlobalBoard.SetNewSync(m);
      ServerSync.Instance.on<GameOverData>("onGameOver",(e)=>{
        //TODO: game over screen
      });
      ServerSync.Instance.on("surrender", ()=>{
        setGameMessage({
          title:"You win!",
          message:"Your opponent either left, or resigned.",
          buttonText:"To menu",
          onButtonClick() {
              nav("/");
          },
          show:true

        })
      });

    });

    ServerSync.Instance.RequestSync();

  });

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
          <Preferences />
        </Overlay>
      )}
      <GameConfigProvider value={gameConfig}>
        
        <GameMessage {...gameMessage} />
        <ChessBoardComponent />
        <GameRightPanel timer={gameTime} chat={chat} sendChat={SendChatMessage} />
      </GameConfigProvider>
    </div >
  );
}


export type ChatMessage = {
  name: string;
  message: string;
};