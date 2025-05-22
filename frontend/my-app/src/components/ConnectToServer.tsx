import React, { useEffect, useRef, useState } from 'react';
import { GameConfig } from '../providers/GameConfigProvider';
import { ServerSync } from '../engine/ServerSync';
import { useNavigate } from 'react-router-dom';
import { GlobalBoard } from '../pages/Game';
import { useToast } from '@chakra-ui/react';



interface LoadingScreenProps {
    config: GameConfig;
    abort: (title : string, desc: string)=>void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ config, abort}) => {


    const initStart = useRef(false);
    const [loadText, setLoadText_] = useState("Establishing connection...");

    let setLoadText = async (m:string)=>{
        setLoadText_(m);
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    const nav = useNavigate();

    const toast = useToast();
    //init
    useEffect(() => {
        if (initStart.current === true) return;
        initStart.current = true;
        (async () => {
            console.log("Board connection init...");
            ServerSync.Instance.SetOnClose(e=>{
                abort("Failed to connect to the server", e.code.toString());
            });
            await ServerSync.Instance.Connect("http://localhost:8080");
            ServerSync.Instance.SetOnClose(e=>{
                abort("Failed to exchange data with the server. Connection aborted.", e.code.toString());
            });
            await setLoadText("Connected. Logging in...");
            if (config.GameMode === "PLAY_ONLINE_HOST") {
                await ServerSync.Instance.InitGameAsHost(config,undefined, setLoadText);
                console.log("Server GO signal received. Ready to play!");
                GlobalBoard.InitBoard(config.startPosition)
                nav("/play", { state: config });
            }
            else if (config.GameMode === "PLAY_ONLINE_JOIN") {
                let cfg = await ServerSync.Instance.InitGameAsClient(config.gameID!);
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
                await ServerSync.Instance.InitGameAsHost(config,true);
                console.log("Server GO signal received. Ready to play!");
                GlobalBoard.InitBoard(config.startPosition)
                nav("/play", { state: config });
            }
        })();
    });

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#f5f5f5'
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