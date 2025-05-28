import { useCallback, useEffect, useRef, useState } from "react";
import BackButton from "../components/BackButton";
import Chat from "../components/Chat";
import ChessBoardComponent from "../components/ChessBoard";
import { GameConfig, GameConfigProvider, useGameConfig } from "../providers/GameConfigProvider";
import Timer from "../components/Timer";
import MoveHistory from "../components/MoveHistory";
import Preferences from "./Prefs";
import { Overlay } from "../components/Overlay";
import GameRightPanel from "../components/GameRightPanel";
import { ChessBoard, GetMoveSAN, Move, PieceColor } from "../engine/ChessBoardLogic";
import { GameOverData, GameOverReason, MessageStateSync, ServerSync } from "../engine/ServerSync";
import GameMessage, { GameMessageProps } from "../components/GameMessage";
import { useNavigate } from "react-router-dom";
import { GameMessageOverlay } from "../components/GameMessageOverlay";
import { GameLeaveButton } from "../components/GameLeave";
import { Box } from "@chakra-ui/react";
import useSound from "use-sound";
import { aud_chat, aud_check, aud_move, aud_take } from "../resources";
import { useGlobalConfig } from "../providers/GlobalConfigProvider";

export const GlobalBoard: ChessBoard = new ChessBoard("SP");
export type Turn = {
  whiteMove: string,
  blackMove: string
}


export default function Game({ gameConfig }: { gameConfig: GameConfig }) {

  const nav = useNavigate();
  const globalCfg = useGlobalConfig();
  const playAud = globalCfg.config.audio.doPlay;
  const playMove = new Audio(aud_move);
  const playTake = new Audio(aud_take);
  playTake.volume = 0.5;
  const playCheck = new Audio(aud_check);
  const playRadio = new Audio(aud_chat);
  playRadio.volume = 0.1;
  const [gameMessage, setGameMessage] = useState<GameMessageProps>({
    show: false,
    buttonText: "",
    message: "",
    onButtonClick() {

    },
    title: ""
  });
  const [moves, setMoves] = useState<Turn[]>([]);

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
      GlobalBoard.currentSync = undefined;
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
      if(playAud)
        playRadio.play();
      setChat((prevMessages) => [...prevMessages, { name: "Opponent", message: m }]);
    });
    ServerSync.Instance.on<string>("onSystemChat", (m) => {
      setChat((prevMessages) => [...prevMessages, { name: "Server", message: m }]);
    });
    ServerSync.Instance.on<MessageStateSync>("onSync", (m) => {
      const prevFen = GlobalBoard.currentSync?.boardFen || gameConfig.startPosition;
      const newFen = m.boardFen;

      const san = GetMoveSAN(prevFen, newFen);
      if (san) {
        if(playAud) playMove.play();
        if (san.includes('x')&&playAud) playTake.play();
        if (san.includes('+')&&playAud) playCheck.play();
        setMoves((prevMoves) => {
          if (prevMoves.length > 0 && prevMoves.slice(prevMoves.length - 1)[0].blackMove === "") {
            let arr = prevMoves.slice(0, prevMoves.length - 1);
            arr.push({
              whiteMove: prevMoves.slice(prevMoves.length - 1)[0].whiteMove,
              blackMove: san
            });
            return arr;
          } else {
            let arr = prevMoves.slice();
            arr.push({ whiteMove: san, blackMove: "" });
            return arr;
          }
        });

      }
      console.log("san: " + san);


      setGameTime({
        blackTime: m.blackTime,
        whiteTime: m.whiteTime
      });
      console.log("Time " + gameTime);

      GlobalBoard.InitBoard(m.boardFen);
      GlobalBoard.SetNewSync(m);
      ServerSync.Instance.on<GameOverData>("onGameOver", (e) => {
        const messages: Record<GameOverReason, string> = {
          "CHECKMATE": "The game concluded in a checkmate.",
          "STALEMATE": "The game concluded in a stalemate.",
          "DRAW": "The game concluded in a draw.",
          "TIME_OUT": "The game concluded in a timeout.",
          "CONN_ERROR": "The game concluded due to a connection error.",
          "SURRENDER": "The game concluded because you surrendered.",
          "GENERAL": "The game concluded for an unknown reason."
        };
        setGameMessage({
          title: e.winner === gameConfig.onlineThisPlayer ? "You win!" : e.winner == null ? "Tie!" : "You lost!",
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
      <Box
        position={"absolute"}
        top={"10px"}
        left={"10px"}
        zIndex={1000}
      >

        <GameLeaveButton onOfferDraw={() => { ServerSync.Instance.Draw() }} onResign={() => {
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
        }} />
      </Box>
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

        <div style={{ position: 'relative', display: 'inline-block' }}>
          <ChessBoardComponent />
          <GameMessageOverlay show={gameMessage.show}>
            <GameMessage {...gameMessage} />
          </GameMessageOverlay>
        </div>
        <GameRightPanel moves={moves} timer={gameTime} chat={chat} sendChat={SendChatMessage} />
      </GameConfigProvider>
    </div >
  );
}


export type ChatMessage = {
  name: string;
  message: string;
};