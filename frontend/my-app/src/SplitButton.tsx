import {
    Box,
    Button,
    HStack,
    Stack,
    useBoolean,
    useToast,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameConfig, GameMode } from "./providers/GameConfigProvider";
import { Overlay } from "./components/Overlay";
import { Input } from "@chakra-ui/react";
import LoadingScreen from "./components/ConnectToServer";

export default function SplitButton() {
    const [hovered, setHovered] = useState(false);
    const [joinGameScreen, setJoinGameScreen] = useState(false);
    const [isLoading, startLoad] = useState(false);

    const [gameId, setGameId] = useState("");

    const nav = useNavigate();
    const toast = useToast();
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
                        () => {
                            const mode: GameMode = "PLAY_ONLINE_HOST";
                            nav("/setup", { state: mode })
                        }
                    }>
                        Host table
                    </Button>
                    <Button className="button" width="50%" height="100%" fontSize="lg"
                        onClick={() => { setJoinGameScreen(true); setHovered(false); }}
                    >
                        Join table
                    </Button>
                </HStack>
                <Overlay hideConfirm={true} show={joinGameScreen} onClose={() => setJoinGameScreen(false)}>

                    <Box
                        backgroundColor="white"
                        padding="20px"
                        borderRadius="8px"
                        height={"20vh"}
                        boxShadow="lg"
                        width={{ base: "90%", sm: "400px" }}
                        textAlign="center"
                    >
                        {/* Join Game Form */}
                        <Stack spacing={4}>

                            <Input
                                placeholder="Enter game code"
                                onChange={(e) => {
                                    setGameId(e.target.value);
                                }}
                                maxLength={12}
                                autoFocus
                                value={gameId}


                            />
                            <Button
                                className="button"
                                width="100%"
                                height="5vh"
                                fontSize="lg"
                                colorScheme="teal"
                                onClick={() => {
                                    setJoinGameScreen(false);
                                    startLoad(true);
                                }}
                            >
                                Join
                            </Button>
                            <Button className="button" width="100%" height="5vh" fontSize="lg" onClick={() => {
                                setJoinGameScreen(false);

                            }}>
                                Cancel
                            </Button>
                        </Stack>
                    </Box>
                </Overlay>
                <Overlay show={isLoading} hideConfirm={true}>
                    <LoadingScreen config={{
                        GameMode: "PLAY_ONLINE_JOIN",
                        onlineThisPlayer: "black",
                        startPosition: "",
                        gameID: gameId
                    }
                    }
                        abort={
                            (t, d) => {
                                startLoad(false);
                                toast({
                                    duration: 5,
                                    title: t,
                                    description: d
                                })
                            }
                        }
                    />
                </Overlay>
            </Box>
        </Box>
    );
}
