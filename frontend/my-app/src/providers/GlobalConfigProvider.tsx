import React, { createContext, useContext } from "react";

// 1. Define the shape of your config
type GlobalConfig = {
    render: {
        imgSize: number;
    }
};

// 2. Create a default config (can also be dynamically generated)
const defaultGlobalConfig: GlobalConfig = {
    render: {
        imgSize: 100,
    }
};

// 3. Create the actual context
const GlobalConfigContext = createContext<GlobalConfig>(defaultGlobalConfig);

// 4. Hook for easier usage
export const useGlobalConfig = () => useContext(GlobalConfigContext);

// 5. Define the provider component
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
