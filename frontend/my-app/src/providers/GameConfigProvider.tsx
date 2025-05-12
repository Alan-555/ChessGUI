import React, { createContext, useContext } from "react";
import { PieceColor } from "../engine/ChessBoardLogic";

export type GameMode = "PLAY_LOCAL_HUMAN" | "PLAY_LOCAL_AI" | "PLAY_ONLINE" | "PLAY_LOCAL_FREE" | "BOARD_SETUP";


export type GameConfig = {
    GameMode : GameMode;
    startPosition : string;
    onlineThisPlayer : PieceColor;
    blackOnBottom?: boolean;
};



const GameConfigContext = createContext<GameConfig|undefined>(undefined);


export const useGameConfig = () => useContext(GameConfigContext);


export const GameConfigProvider: React.FC<{
    children: React.ReactNode;
    value?: GameConfig;
}> = ({ children, value }) => {
    return (
        <GameConfigContext.Provider value={value}>
            {children}
        </GameConfigContext.Provider>
    );
};


