import { Box, Button, Grid, GridItem, Image } from "@chakra-ui/react";
import SplitButton from "../SplitButton";
import { useNavigate } from "react-router-dom";
import { GameMode } from "../providers/GameConfigProvider";
import { useState } from "react";
import Preferences from "./Prefs";
import { Overlay } from "../components/Overlay";
import { AnimatePresence } from "framer-motion";
import { img_menu } from "../resources";

export default function Menu() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  return (
    <Box position="relative" width="100vw" height="100vh" overflow="hidden" padding={"10vh 10vw"}>
      {/* Blurred background image */}
      <Image
        src={img_menu} // replace with actual image path
        alt="Background"
        objectFit="cover"
        width="100%"
        height="100%"
        position="absolute"
        top="0"
        left="0"
        zIndex={-1}
        filter="blur(10px)"
        transform="scale(1.05);"
      />

      {/* Grid layout with gaps in the center */}
      <Grid
        templateRows="1fr 10px 1fr"
        templateColumns="1fr 10px 1fr"
        height="100%"
        width="100%"
        gap="0"
        position="relative"
        zIndex="1"
        sx={{
          ".button": {
            color: "white",
            backgroundColor: "rgba(79, 79, 79, 0.7)"
          },
          ".button:hover": {
            backgroundColor: "rgba(85, 85, 85, 0.79)"
          }
        }}
      >
        <GridItem rowSpan={1} colSpan={1}>
          <Button
            className="button"
            width="100%"
            height="100%"
            fontSize="2xl"
            borderRadius="none"
            onClick={() => {
              let mode: GameMode = "PLAY_LOCAL_AI";
              navigate("/setup", { state: mode })
            }}
          >
            VS Stockfish
          </Button>
        </GridItem>

        <GridItem rowSpan={1} colSpan={1} />

        <GridItem rowSpan={1} colSpan={1}>
          <SplitButton />
        </GridItem>

        <GridItem rowSpan={1} colSpan={1} />

        <GridItem rowSpan={1} colSpan={1} />

        <GridItem rowSpan={1} colSpan={1} />

        <GridItem rowSpan={1} colSpan={1}>
          <Button
            width="100%"
            height="100%"
            fontSize="2xl"
            borderRadius="none"
            className="button"
            onClick={() => {
              let mode: GameMode = "PLAY_LOCAL_HUMAN";
              navigate("/setup", { state: mode })
            }}
          >
            Local Game
          </Button>
        </GridItem>

        <GridItem rowSpan={1} colSpan={1} />

        <GridItem rowSpan={1} colSpan={1}>
          <Button
            width="100%"
            height="100%"
            fontSize="2xl"
            borderRadius="none"
            className="button"
            onClick={() => setPrefsOpen(true)}
          >
            Preferences
          </Button>
        </GridItem>
      </Grid>
      <Button
        position="absolute"
        bottom="5vh"
        right="5vw"
        fontSize="lg"
        padding="1rem 2rem"
        borderRadius="md"
        className="button"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        About
      </Button>

      {isModalOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          zIndex="1000"
        >
          <Box
            backgroundColor="white"
            padding="2rem"
            borderRadius="md"
            boxShadow="lg"
            maxWidth="400px"
            textAlign="center"
          >
            <p>This application was developed as a semestral work for KIV/UUR. Author: Alexandr Vituško</p>
            <br/>
            <b>Graphic Attribution</b>
            <p>Chess piece images used in this application are based on assets by M. János Uray, available at <a style={{color:"blue"}} href="https://greenchess.net/info.php?item=downloads">GreenChess.net</a> Licensed under <a style={{color:"blue"}} href="https://creativecommons.org/licenses/by-sa/3.0/deed.en">Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)</a></p>
            <Button
              marginTop="1rem"
              onClick={() => setIsModalOpen(false)}
              className="button"
            >
              Close
            </Button>
          </Box>
        </Box>
      )}
      <Overlay key={"prefs"} show={prefsOpen} onClose={() => setPrefsOpen(false)}>
        <Preferences />
      </Overlay>
    </Box>
  );
}
