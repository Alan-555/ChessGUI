import React, { useEffect, useRef } from 'react';
import { GameConfig } from '../providers/GameConfigProvider';
import { ServerSync } from '../engine/ServerSync';
import { useNavigate } from 'react-router-dom';
import { GlobalBoard } from '../pages/Game';



interface LoadingScreenProps {
    config: GameConfig;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ config }) => {


    const initStart = useRef(false);

    const nav = useNavigate();

    //init
    useEffect(() => {
        if (initStart.current === true) return;
        initStart.current = true;
        (async () => {
            console.log("Board connection init...");

            await ServerSync.Instance.Connect("http://localhost:8080");
            if (config.GameMode === "PLAY_ONLINE_HOST") {
                await ServerSync.Instance.InitGameAsHost(config);
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
                GlobalBoard.InitBoard(newConfig.startPosition)
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
            <h2>Connecting to server...</h2>
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