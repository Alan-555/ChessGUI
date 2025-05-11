import React, { createContext, useContext } from "react";


type GlobalConfig = {
    render: {
        imgSize: number;
        preferredPlayerSide?: "BottomMe" | "BottomWhite";
    }
};


const defaultGlobalConfig: GlobalConfig = {
    render: {
        imgSize: 120,
        preferredPlayerSide: "BottomMe"
    }
};


const GlobalConfigContext = createContext<GlobalConfig>(defaultGlobalConfig);


export const useGlobalConfig = () => useContext(GlobalConfigContext);


export const GlobalConfigProvider: React.FC<{
    children: React.ReactNode;
    value?: GlobalConfig; // optional override
}> = ({ children, value }) => {
    return (
        <GlobalConfigContext.Provider value={value ?? defaultGlobalConfig}>
            {children}
        </GlobalConfigContext.Provider>
    );
};
