import { Box, Button } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// Create a motion-enabled Box
const MotionBox = motion(Box);

export default function MenuWithTransition() {
  const [screen, setScreen] = useState<"menu" | "prefs">("menu");

  return (
    <Box position="relative" width="100vw" height="100vh" overflow="hidden">
      <AnimatePresence mode="wait">
        {screen === "menu" && (
          <MotionBox
            key="menu"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.4 }}
            position="absolute"
            width="100%"
            height="100%"
            bg="gray.800"
            display="flex"
            justifyContent="center"
            alignItems="center"
            color="white"
            fontSize="2xl"
          >
            <Button onClick={() => setScreen("prefs")}>Go to Preferences</Button>
          </MotionBox>
        )}

        {screen === "prefs" && (
          <MotionBox
            key="prefs"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            position="absolute"
            width="100%"
            height="100%"
            bg="blue.800"
            display="flex"
            justifyContent="center"
            alignItems="center"
            color="white"
            fontSize="2xl"
          >
            <Button onClick={() => setScreen("menu")}>Back to Menu</Button>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}
