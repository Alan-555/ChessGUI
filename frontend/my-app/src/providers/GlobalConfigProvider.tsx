import { StyleConfig } from "@chakra-ui/react";
import React, { createContext, useContext, useState } from "react";



export type BoardThemesType = {
    [key:string] : {
        darkSquareStyles : React.CSSProperties,
        lightSquareStyles : React.CSSProperties,
    }
}

export const BoardThemes: BoardThemesType = {
    "Blue": {
        darkSquareStyles: {
            background: "rgb(55, 65, 81)"
        },
        lightSquareStyles: {
            background: "rgb(229, 231, 235)"
        }
    },
    "Glass": {
        darkSquareStyles: {
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)"
        },
        lightSquareStyles: {
            background: "rgb(255, 255, 255)",
            backdropFilter: "blur(4px)"
        }
    },
    "Blue light": {
        darkSquareStyles: {
            background: "linear-gradient(135deg, rgb(30, 58, 138), rgb(37, 99, 235))"
        },
        lightSquareStyles: {
            background: "linear-gradient(135deg, rgb(147, 197, 253), rgb(191, 219, 254))"
        }
    },
    "Forest": {
        darkSquareStyles: {
            background: "linear-gradient(145deg, #2e7d32, #1b5e20)"
        },
        lightSquareStyles: {
            background: "linear-gradient(145deg, #a5d6a7, #c8e6c9)"
        }
    },
    "Night Mode Glow": {
        darkSquareStyles: {
            background: "radial-gradient(circle at center, #000000, #1f2937)",
            boxShadow: "inset 0 0 10px #00f2ff"
        },
        lightSquareStyles: {
            background: "rgb(43, 66, 72)",
            boxShadow: "inset 0 0 5px #00f2ff"
        }
    },
    "Sandstorm": {
        darkSquareStyles: {
            background: "repeating-linear-gradient(45deg, #c2b280, #c2b280 10px, #a58f5b 10px, #a58f5b 20px)"
        },
        lightSquareStyles: {
            background: "#f5f5dc"
        }
    },
    "Wood": {
        darkSquareStyles: {
            background: "url('https://www.transparenttextures.com/patterns/retina-wood.png')",
            backgroundColor: "black"
        },
        lightSquareStyles: {
            background: "url('https://www.transparenttextures.com/patterns/retina-wood.png')",
            backgroundColor: "rgb(188, 188, 188)"
        }
    }
    ,
    "Shariq": {
        darkSquareStyles: {
            background: "#6b0303",
            
        },
        lightSquareStyles: {
            background: "radial-gradient(circle at center, #d44802, #786c30)"
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
        theme : Object.keys(BoardThemes)[0]
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
