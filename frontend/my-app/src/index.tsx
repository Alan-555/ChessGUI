import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from "react-router-dom";
import { Box, ChakraProvider } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import Menu from "./pages/Menu";
import Preferences from "./pages/Prefs";
import AnimatedRouteWrapper from "./components/AnimationWrapper";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import ChessSetup from "./pages/Setup";
import BackButton from "./components/BackButton";
import Game from "./pages/Game";
import { GlobalConfigProvider } from "./providers/GlobalConfigProvider";
import theme from "./theme";
import { ServerSync } from "./engine/ServerSync";

function AppRoutes() {
  const location = useLocation();
  const prevLocation = useRef(location);
  
  useEffect(() => {
    // Runs when location changes
    if (prevLocation.current.pathname !== location.pathname) {
      console.log('Route changed to '+location.pathname);
      if(ServerSync.Instance.IsConnected && location.pathname !=="/play"){
        ServerSync.Instance.Quit("Client navigated out of session"); //Going away
      }
      prevLocation.current = location;
    }
  }, [location]);
  return (
    <Box position="relative" width="100vw" height="100vh" overflow="hidden">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={<AnimatedRouteWrapper><Menu /></AnimatedRouteWrapper>}
          />
          <Route
            path="/preferences"
            element={<AnimatedRouteWrapper><BackButton /><Preferences /></AnimatedRouteWrapper>}
          />
          <Route
            path="/setup"
            element={<AnimatedRouteWrapper><BackButton /><ChessSetup mode={location.state} /></AnimatedRouteWrapper>}
          />
          <Route
            path="/play"
            element={
              <AnimatedRouteWrapper>
          {location.state === null&&location.pathname==="/play" ? (
            // Redirect to home if gameConfig is undefined
            (() => {
              console.log("nav back!!!!");
              
                window.location.href = "/";
              return null;
            })()
          ) : (
            <Game gameConfig={location.state} />
          )}
              </AnimatedRouteWrapper>
            }
          />
        </Routes>

      </AnimatePresence>
    </Box>
  );
}

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <GlobalConfigProvider>
        <Router>
          <AppRoutes />
        </Router>
      </GlobalConfigProvider>
    </ChakraProvider>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);