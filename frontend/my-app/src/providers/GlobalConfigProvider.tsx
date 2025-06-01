import { StyleConfig } from "@chakra-ui/react";
import React, { createContext, useContext, useState, useEffect } from "react";



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
    },
    "A bad trip":{
        darkSquareStyles: {
            background: "repeating-conic-gradient(from 45deg, #ff00cc 0deg 10deg, #3333ff 10deg 20deg, #00ffcc 20deg 30deg, #fffb00 30deg 40deg, #ff00cc 40deg 50deg)",
            backgroundSize: "40px 40px",
            border: "3px dashed #ff0000",
            boxShadow: "0 0 20px 10px #00ffcc, inset 0 0 10px 5px #ff00cc",
            filter: "contrast(2) hue-rotate(90deg) saturate(3)",
            animation: "spin 2s linear infinite"
        },
        lightSquareStyles: {
            background: "linear-gradient(135deg, #00ffcc 25%, #fffb00 50%, #ff00cc 75%, #3333ff 100%)",
            backgroundSize: "200% 200%",
            border: "4px dotted #00ffcc",
            boxShadow: "0 0 30px 15px #fffb00, inset 0 0 15px 7px #3333ff",
            filter: "blur(1px) brightness(1.5) invert(0.2)",
            animation: "pulse 1s alternate infinite"
        }
    },
    "Maria & Teresa":{
        darkSquareStyles: {
            background: "url('https://cdn-images.dzcdn.net/images/cover/186193b9de40a2be42a15da3ff3cfeb2/0x1900-000000-80-0-0.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "black"
        },
        lightSquareStyles: {
            background: "url('https://lh3.googleusercontent.com/SIAoNF-wA6aFwtSdhXOQYROBgZXa804vd_9Y2aA0CNw8muUu-OZ9ZtwDTkWgt607aHURX1V1NWWgWkU=w544-h544-p-l90-rj')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "rgb(188, 188, 188)"
        }
    }
};


export const Themes = Object.keys(BoardThemes) 


type GlobalConfig = {
    render: {
        imgSize: number | undefined;
        preferredPlayerSide?: "BottomMe" | "BottomWhite";
        theme : string
    },
    audio:{
        doPlay: boolean
    },
    server:{
        url:string
    }
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
    audio:{
        doPlay:true
    },
    server:{
        url:"http://localhost:8080"
    }
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

    // Inject global keyframes for custom animations
    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
            @keyframes spin {
                0% { transform: rotate(0deg) scale(1) translateX(-50px);}
                50% {transform: rotate(180deg) scale(0)  translateX(50px);}
                100% { transform: rotate(360deg) scale(1) translateX(-50px);}
            }
            @keyframes pulse {
                0% { filter: blur(1px) brightness(1.5) invert(0.2); transform: rotate(0deg);  }
                100% { filter: blur(2px) brightness(2) invert(0.4); transform: rotate(-360deg);}
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <GlobalConfigContext.Provider value={{ config, setConfig }}>
            {children}
        </GlobalConfigContext.Provider>
    );
};
