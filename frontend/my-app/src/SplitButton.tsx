import {
    Box,
    Button,
    HStack,
    Stack,
    useBoolean,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameMode } from "./providers/GameConfigProvider";

export default function SplitButton() {
    const [hovered, setHovered] = useState(false);
    const nav = useNavigate();
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
            height="100%"
        >
            <Box
                position="relative"
                width="100%"
                height="100%"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Initial Button */}
                <Button
                    position="absolute"
                    width="100%"
                    height="100%"
                    opacity={hovered ? 0 : 1}
                    transform={hovered ? "scale(0.95)" : "scale(1)"}
                    transition="all 0.4s ease"
                    zIndex={hovered ? 0 : 1}
                    fontSize="xl"
                    className="button"
                >
                    Multiplayer
                </Button>

                {/* Split Buttons */}
                <HStack
                    spacing="10px"
                    opacity={hovered ? 1 : 0}
                    transform={hovered ? "scale(1)" : "scale(1.1)"}
                    transition="all 0.4s ease"
                    width="100%"
                    height="100%"
                    zIndex={hovered ? 1 : 0}
                >
                    <Button className="button" width="50%" height="100%" fontSize="lg" onClick={
                        ()=>{
                            const mode : GameMode = "PLAY_ONLINE_HOST";
                            nav("/setup",{state:mode})
                        }
                    }>
                        Host table
                    </Button>
                    <Button className="button" width="50%" height="100%" fontSize="lg">
                        Join table
                    </Button>
                </HStack>
            </Box>
        </Box>
    );
}
