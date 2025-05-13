import { StyleConfig } from "@chakra-ui/react";
import React, { createContext, useContext, useState } from "react";



export type BoardThemesType = {
    [key:string] : {
        darkSquareStyles : React.CSSProperties,
        lightSquareStyles : React.CSSProperties,
    }
}

export const BoardThemes: BoardThemesType = {
    "Dark Blue": {
        darkSquareStyles: {
            background: "rgb(55, 65, 81)" // gray.700 in RGB
        },
        lightSquareStyles: {
            background: "rgb(229, 231, 235)" // gray.200 in RGB
        }
    },
    "Cool Gradient": {
        darkSquareStyles: {
            background: "linear-gradient(135deg, rgb(30, 58, 138), rgb(37, 99, 235))" // #1e3a8a and #2563eb in RGB
        },
        lightSquareStyles: {
            background: "linear-gradient(135deg, rgb(147, 197, 253), rgb(191, 219, 254))" // #93c5fd and #bfdbfe in RGB
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
        theme : "Dark Blue"
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
