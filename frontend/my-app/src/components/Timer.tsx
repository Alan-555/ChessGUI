import React, { useState, useEffect } from 'react';
import { PieceColor } from '../engine/ChessBoardLogic';
import { useGlobalConfig } from '../providers/GlobalConfigProvider';
import { useGameConfig } from '../providers/GameConfigProvider';

const Timer = ({ timeWhite, timeBlack, activeTimer }: { timeWhite: number, timeBlack: number, activeTimer: PieceColor | undefined }) => {
    const config = useGlobalConfig();
    const gameSettings = useGameConfig();
    const bottomColor: PieceColor = config.config.render.preferredPlayerSide === "BottomMe" ? gameSettings!.onlineThisPlayer : "white";

    const [topTime, setTopTime] = useState(bottomColor === "black" ? timeWhite : timeBlack);
    const [bottomTime, setBottomTime] = useState(bottomColor === "black" ? timeBlack : timeWhite);

    useEffect(() => {
        const interval = setInterval(() => {
            if (activeTimer === bottomColor)
                setBottomTime((prev) => prev - 1);
            else if(activeTimer !== undefined)
                setTopTime((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (time: number) => {
        time = time/1000; // Convert milliseconds to seconds
        time = Math.floor(time);
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ fontSize: '4vh', marginBottom: '10px' }}>{formatTime(topTime)}</div>
            <div style={{ fontSize: '4vh', marginTop: '10px' }}>{formatTime(bottomTime)}</div>
        </div>
    );
};

export default Timer;