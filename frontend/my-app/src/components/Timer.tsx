import React, { useState, useEffect } from 'react';
import { PieceColor } from '../engine/ChessBoardLogic';
import { useGlobalConfig } from '../providers/GlobalConfigProvider';
import { useGameConfig } from '../providers/GameConfigProvider';
import { ServerSync } from '../engine/ServerSync';

const Timer = ({ timeWhite, timeBlack, activeTimer }: { timeWhite: number, timeBlack: number, activeTimer: PieceColor | undefined }) => {
    const config = useGlobalConfig();
    const gameSettings = useGameConfig();
    const bottomColor: PieceColor = config.config.render.preferredPlayerSide === "BottomMe" ? gameSettings!.onlineThisPlayer : "white";

    const [topTime, setTopTime] = useState(bottomColor === "black" ? timeWhite : timeBlack);
    const [bottomTime, setBottomTime] = useState(bottomColor === "black" ? timeBlack : timeWhite);
    const [topSyncTime, setTopSyncTime] = useState(bottomColor === "black" ? timeWhite : timeBlack);
    const [bottomSyncTime, setBottomSyncTime] = useState(bottomColor === "black" ? timeBlack : timeWhite);
    const [syncStartTimeStamp, setSyncStartTimeStamp] = useState(Date.now());


    useEffect(() => {
        setTopSyncTime(bottomColor === "white" ? timeBlack : timeWhite);
        setBottomSyncTime(bottomColor === "white" ? timeWhite : timeBlack);
        setSyncStartTimeStamp(Date.now());
    }, [bottomColor, timeBlack, timeWhite]);


    useEffect(() => {
        if(bottomSyncTime===0&&topSyncTime===0){

            return;
        }
        const interval = setInterval(() => {
            if (activeTimer === bottomColor && ServerSync.Instance.IsConnected)
                setBottomTime(() => {
                    const elapsed = Date.now() - syncStartTimeStamp;
                    return bottomSyncTime - elapsed;
                });
            else if (activeTimer !== undefined && ServerSync.Instance.IsConnected)
                setTopTime(() => {
                    const elapsed = Date.now() - syncStartTimeStamp;
                    return topSyncTime - elapsed;
                });
        }, 10);

        return () => clearInterval(interval);
    }, [activeTimer, bottomColor, bottomTime, bottomSyncTime, topTime, topSyncTime]);

    const formatTime = (time_: number) => {
        if(topSyncTime===0&&bottomSyncTime===0){
            return "--:--";
        }
        time_ = Math.max(0,time_);
        let time = time_ / 1000; // Convert milliseconds to seconds
        time = Math.floor(time);
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const millis = (time_) % 1000;
        const millisShow = time < 60 ? `.${millis.toString().padStart(3,'0').slice(0,2)}` : "";
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}${millisShow}`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ fontSize: '4vh', marginBottom: '10px' }}>{formatTime(topTime)}</div>
            <div style={{ fontSize: '4vh', marginTop: '10px' }}>{formatTime(bottomTime)}</div>
        </div>
    );
};

export default Timer;