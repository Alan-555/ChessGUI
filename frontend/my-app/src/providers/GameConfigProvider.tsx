import React, { createContext, useContext } from "react";


type GameConfig = {
    
};


const defaultGameConfig: GameConfig = {

};


const GameConfigContext = createContext<GameConfig>(defaultGameConfig);


export const useGameConfig = () => useContext(GameConfigContext);


export const GameConfigProvider: React.FC<{
    children: React.ReactNode;
    value?: GameConfig; // optional override
}> = ({ children, value }) => {
    return (
        <GameConfigContext.Provider value={value ?? defaultGameConfig}>
            {children}
        </GameConfigContext.Provider>
    );
};
