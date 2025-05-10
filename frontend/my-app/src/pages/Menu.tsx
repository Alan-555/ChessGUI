import { Box, Button, Grid, GridItem, Image } from "@chakra-ui/react";
import SplitButtonExample from "../SplitButton";
import { useNavigate } from "react-router-dom";
import { GameMode } from "../providers/GameConfigProvider";

export default function Menu() {
  const navigate = useNavigate();
  return (
    <Box position="relative" width="100vw" height="100vh" overflow="hidden" padding={"10vh 10vw"}>
      {/* Blurred background image */}
      <Image
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYx5IT0jbepzxU4fB_ruAHsucVmFTqqyNwng&s" // replace with actual image path
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
            color:"white",
            backgroundColor : "rgba(79, 79, 79, 0.7)"
          },
          ".button:hover":{
            backgroundColor : "rgba(85, 85, 85, 0.79)"
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
            onClick={()=>{
              let mode : GameMode = "PLAY_LOCAL_AI";
              navigate("/setup",{state:mode})
            }}
          >
            VS Stockfish
          </Button>
        </GridItem>

        <GridItem rowSpan={1} colSpan={1} />

        <GridItem rowSpan={1} colSpan={1}>
          <SplitButtonExample/>
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
            onClick={()=>{
              let mode : GameMode = "PLAY_LOCAL_FREE";
              navigate("/setup",{state:mode})
            }}
          >
            Free play
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
            onClick={()=>navigate("/preferences")}
          >
            Preferences
          </Button>
        </GridItem>
      </Grid>
    </Box>
  );
}
