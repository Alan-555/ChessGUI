import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Box, ChakraProvider } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import Menu from "./pages/Menu";
import Preferences from "./pages/Prefs";
import AnimatedRouteWrapper from "./components/AnimationWrapper";
import React from "react";
import ReactDOM from "react-dom/client";
import ChessSetup from "./pages/Setup";
import BackButton from "./components/BackButton";

function AppRoutes() {
  const location = useLocation();

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
          element={<AnimatedRouteWrapper><BackButton/><Preferences /></AnimatedRouteWrapper>}
        />
        <Route
          path="/setup"
          element={<AnimatedRouteWrapper><BackButton/><ChessSetup /></AnimatedRouteWrapper>}
        />
      </Routes>
      
    </AnimatePresence>
  </Box>
  );
}

export default function App() {
  return (
    <ChakraProvider>
      <Router>
        <AppRoutes />
      </Router>
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