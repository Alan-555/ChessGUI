import { Box, Button, Flex } from "@chakra-ui/react";
import Timer from "./Timer";
import MoveHistory from "./MoveHistory";
import { useState } from "react";
import { ChatMessage, GlobalBoard } from "../pages/Game";
import Chat from "./Chat";

const GameRightPanel = ({chat,sendChat,timer}:{chat:ChatMessage[],sendChat:(message : string)=>void, timer: {whiteTime:number, blackTime:number} | null}) => {

    return (
        <Flex
            direction="column"
            w={{ base: "90%", sm: "300px", md: "350px", lg: "400px" }}
            h="100%"
            px={4}
            py={2}
            gap={4} // space between vertical sections
            marginBottom={"0px"}
        >
            {/* Top section */}
            <Box maxHeight={"40vh"}  flex="1" bg="gray.100" borderRadius="md" p={4} boxShadow="sm">
                <Chat messages={chat} onSendMessage={(message) => {
                    sendChat(message);
                }} />
            </Box>

            <Box maxHeight={"15vh"} flex="1" bg="gray.100" borderRadius="md" p={4} boxShadow="sm">
                {
                    timer!=null && (
                        <Timer activeTimer={GlobalBoard.currentSync?.playerToMove} timeBlack={timer.blackTime} timeWhite={timer.whiteTime} />
                    )
                }
            </Box>

            <Box height={"40vh"} flex="1" bg="gray.100" borderRadius="md" p={4} boxShadow="sm">
                <MoveHistory moves={
                    [
                        { white: "e4", black: "e5" },
                        { white: "Nf3", black: "Nc6" },
                        { white: "Bb5", black: "a6" },
                        { white: "Ba4", black: "Nf6" },
                        { white: "O-O", black: "Be7" },
                        { white: "O-O", black: "Be7" },
                        { white: "O-O", black: "Be7" },
                        { white: "O-O", black: "Be7" },
                        { white: "O-O", black: "Be7" },
                        { white: "O-O", black: "Be7" },
                    ]
                } onNext={() => { }} onPrevious={() => { }} showNavigationButtons={true} />
            </Box>
        </Flex>
    );
};

export default GameRightPanel;
