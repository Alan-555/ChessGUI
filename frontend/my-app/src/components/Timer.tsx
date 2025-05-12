import React, { useState, useEffect } from 'react';

const Timer = ({timeWhite,timeBlack, activeTimer}:{timeWhite : number, timeBlack : number, activeTimer : boolean}) => {
     //TODO: set depening on side settings
    const topPlayer = true; // true = white, false = black

    const [topTime, setTopTime] = useState(topPlayer ? timeWhite : timeBlack);
    const [bottomTime, setBottomTime] = useState(topPlayer ? timeBlack : timeWhite);

    useEffect(() => {   
        const interval = setInterval(() => {
            if(activeTimer === topPlayer)
                setTopTime((prev) => prev - 1);
            else
                setBottomTime((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ fontSize: '24px', marginBottom: '-10px' }}>{formatTime(topTime)}</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '-10px' }}>Timer</div>
            <div style={{ fontSize: '24px', marginTop: '-10px' }}>{formatTime(bottomTime)}</div>
        </div>
    );
};

export default Timer;