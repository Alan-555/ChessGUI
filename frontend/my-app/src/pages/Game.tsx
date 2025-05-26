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
import { GameOverData, GameOverReason, MessageStateSync, ServerSync } from "../engine/ServerSync";
import GameMessage, { GameMessageProps } from "../components/GameMessage";
import { useNavigate } from "react-router-dom";

export const GlobalBoard: ChessBoard = new ChessBoard("SP");

export default function Game({ gameConfig }: { gameConfig: GameConfig }) {

  const nav = useNavigate();
  const [gameMessage, setGameMessage] = useState<GameMessageProps>({
    show: false,
    buttonText: "",
    message: "",
    onButtonClick() {

    },
    title: ""
  });
  const [boardFen, setBoardFen] = useState<string>(gameConfig.startPosition);

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
    console.log("crap alerady prepared? " + once.current);
    if (once.current)
      return;
    once.current = true;
    if (!ServerSync.Instance.IsConnected) {
      nav("/");
    }
    ServerSync.Instance.offAll("onClose");
    ServerSync.Instance.on("onClose", (e) => {
      setGameMessage({
        title: "Connection lost",
        message: "The server aborted connection. (" + (e.reason || e.code) + ")",
        buttonText: "To menu",
        onButtonClick() {
          nav("/");
        },
        show: true
      });
    });
    ServerSync.Instance.on<string>("onChat", (m) => {
      setChat((prevMessages) => [...prevMessages, { name: "Opponent", message: m }]);
    });
    ServerSync.Instance.on<string>("onSystemChat", (m) => {
      setChat((prevMessages) => [...prevMessages, { name: "Server", message: m }]);
    });
    ServerSync.Instance.on<MessageStateSync>("onSync", (m) => {
      if (gameTime)
        setGameTime({
          blackTime: m.blackTime,
          whiteTime: m.whiteTime
        });
      GlobalBoard.InitBoard(m.boardFen);
      GlobalBoard.SetNewSync(m);
      ServerSync.Instance.on<GameOverData>("onGameOver", (e) => {
        const messages: Record<GameOverReason, string> = {
          "CHECKMATE": "The game concluded in a checkmate.",
          "STALEMATE": "The game concluded in a stalemate.",
          "DRAW": "The game concluded in a draw.",
          "TIMEOUT": "The game concluded in a timeout.",
          "CONN_ERROR": "The game concluded due to a connection error.",
          "SURRENDER": "The game concluded because you surrendered.",
          "GENERAL": "The game concluded for an unknown reason."
        };
        setGameMessage({
          title: e.winner === gameConfig.onlineThisPlayer ? "You win!" : e.winner==null ? "Stalemate!" : "You lost!",
          message: messages[e.reason],
          buttonText: "To menu",
          onButtonClick() {
            nav("/");
          },
          show: true

        });
      });
      ServerSync.Instance.on("surrender", () => {
        setGameMessage({
          title: "You win!",
          message: "Your opponent either left, or resigned.",
          buttonText: "To menu",
          onButtonClick() {
            nav("/");
          },
          show: true

        });
      });

    });

    ServerSync.Instance.RequestSync();

  });

  return (
    <div style={{ userSelect: "none", WebkitUserSelect: "none", msUserSelect: "none", display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <button
        onClick={() => {
          ServerSync.Instance.Resign();
          setGameMessage({
            title: "You lost!",
            message: "You have resigned the game.",
            buttonText: "To menu",
            onButtonClick() {
              nav("/");
            },
            show: true,
          });
        }}
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          zIndex: 1000,
          background: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
        }}
      >
        Resign
      </button>
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