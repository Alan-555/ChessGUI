import React, { useEffect, useRef, useState } from 'react';
import { GameConfig } from '../providers/GameConfigProvider';
import { ServerSync } from '../engine/ServerSync';
import { useNavigate } from 'react-router-dom';
import { GlobalBoard } from '../pages/Game';
import { useToast } from '@chakra-ui/react';



interface LoadingScreenProps {
    config: GameConfig;
    abort: (title: string, desc: string) => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ config, abort }) => {


    const initStart = useRef(false);
    const [loadText, setLoadText_] = useState("Establishing connection...");
    const [codeText, setCodeText] = useState("");

    let setLoadText = async (m: string, code? : string) => {
        
        if(code)
            setCodeText(code);
        setLoadText_(m);
        await new Promise(resolve => setTimeout(resolve, 150));
    }

    const nav = useNavigate();

    const toast = useToast();
    //init
    useEffect(() => {
        if (initStart.current === true) return;
        initStart.current = true;
        (async () => {
            try {
                console.log("Board connection init...");
                ServerSync.Instance.on("onClose", e => {
                    abort("Failed to establish connection to the server.", e.code.toString());
                });
                await ServerSync.Instance.Connect("http://localhost:8080");
                ServerSync.Instance.offAll("onClose");
                ServerSync.Instance.on("onClose", e => {
                    abort("Server aborted connection", e.reason);
                });
                await setLoadText("Connected. Logging in...");
                if (config.GameMode === "PLAY_ONLINE_HOST") {
                    await ServerSync.Instance.InitGameAsHost(config, undefined, setLoadText);
                    console.log("Server GO signal received. Ready to play!");
                    GlobalBoard.InitBoard(config.startPosition)
                    nav("/play", { state: config });
                }
                else if (config.GameMode === "PLAY_ONLINE_JOIN") {

                    let cfg = await ServerSync.Instance.InitGameAsClient(config.gameID!, setLoadText);

                    let newConfig = {
                        GameMode: "PLAY_ONLINE_JOIN",
                        onlineThisPlayer: cfg.youAre,
                        startPosition: cfg.boardFen,
                        gameID: config.gameID,
                        time: cfg.blackTime
                    }
                    console.log("Server GO signal received. Ready to join!");
                    GlobalBoard.InitBoard(newConfig.startPosition);
                    nav("/play", { state: newConfig });


                }
                else if (config.GameMode === "PLAY_LOCAL_AI") {
                    await ServerSync.Instance.InitGameAsHost(config, true, setLoadText);
                    console.log("Server GO signal received. Ready to play!");
                    GlobalBoard.InitBoard(config.startPosition)
                    nav("/play", { state: config });
                }
                else if(config.GameMode === "PLAY_LOCAL_HUMAN"){
                    abort("Unimplemented game mode.", "The selected game mode has not been implemented yet in this version.");
                }
                else {
                    abort("Invalid game mode.", "The selected game mode is not supported.");
                }
            }
            catch (e: any) {
                abort("Failed to negotiate with the server. (" + e.errType + ")", e?.message || "An unknown error occurred.");
            }
        })();
    });

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '20vh',
            background: '#f5f5f5',
            width:"50vw"
        }}>
            <div className="loader" style={{
                border: '8px solid #f3f3f3',
                borderTop: '8px solid #3498db',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                animation: 'spin 1s linear infinite'
            }} />
            <h2>{loadText}.</h2>
            <p  onMouseDown={
                ()=>{
                    console.log("TETETTET");
                    
                    navigator.clipboard.writeText(codeText);
                    toast({
                        title: "Copied to clipboard",
                        description: codeText ? `Code "${codeText}" copied.` : "No code to copy.",
                        status: "success",
                        duration: 1000,
                        isClosable: true,
                    });
                }
            }
            style={{ fontSize: "3em", color: "rgb(3, 63, 147)", cursor: "pointer" }}
            title={codeText ? "Click to copy code" : ""}
        >
            {codeText}</p>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default LoadingScreen;