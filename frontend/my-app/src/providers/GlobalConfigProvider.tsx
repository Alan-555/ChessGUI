import { StyleConfig } from "@chakra-ui/react";
import React, { createContext, useContext, useState } from "react";



export type BoardThemesType = {
    [key:string] : {
        name : string,
        darkSquareStyles : React.CSSProperties,
        lightSquareStyles : React.CSSProperties
    }
}

export const BoardThemes: BoardThemesType = {
    "DARK_BLUE": {
        name: "Dark Blue",
        darkSquareStyles: {
            background: "gray.700"
        },
        lightSquareStyles: {
            background: "gray.200"
        }
    },
    "COOL": {
        name: "Cool Gradient",
        darkSquareStyles: {
            background: "linear-gradient(135deg, #1e3a8a, #2563eb)"
        },
        lightSquareStyles: {
            background: "linear-gradient(135deg, #93c5fd, #bfdbfe)"
        }
    }
};

export const Themes = Object.keys(BoardThemes) 


type GlobalConfig = {
    render: {
        imgSize: number | undefined;
        preferredPlayerSide?: "BottomMe" | "BottomWhite";
        theme : string
    };
};

type GlobalConfigContextType = {
    config: GlobalConfig;
    setConfig: React.Dispatch<React.SetStateAction<GlobalConfig>>;
};

const defaultGlobalConfig: GlobalConfig = {
    render: {
        imgSize: undefined,
        preferredPlayerSide: "BottomMe",
        theme : "DARK_BLUE"
    },
};

export function GetRenderSize(){
    const cfg = useGlobalConfig().config;
    if(cfg.render.imgSize)
        return cfg.render.imgSize+"px";
    return `calc(100vh / 8)`;
}

const GlobalConfigContext = createContext<GlobalConfigContextType | undefined>(undefined);

export const useGlobalConfig = () => {
    const ctx = useContext(GlobalConfigContext);
    if (!ctx) throw new Error("useGlobalConfig must be used within GlobalConfigProvider");
    return ctx;
};

export const GlobalConfigProvider: React.FC<{
    children: React.ReactNode;
    initialValue?: GlobalConfig;
}> = ({ children, initialValue }) => {
    const [config, setConfig] = useState<GlobalConfig>(initialValue ?? defaultGlobalConfig);

    return (
        <GlobalConfigContext.Provider value={{ config, setConfig }}>
            {children}
        </GlobalConfigContext.Provider>
    );
};
