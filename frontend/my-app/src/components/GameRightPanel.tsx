import { Box, Flex } from "@chakra-ui/react";
import Timer from "./Timer";
import MoveHistory from "./MoveHistory";
import { ChatMessage, GlobalBoard, Turn } from "../pages/Game";
import Chat from "./Chat";

const GameRightPanel = ({chat,sendChat,timer, moves}:{chat:ChatMessage[],moves : Turn[],sendChat:(message : string)=>void, timer: {whiteTime:number, blackTime:number} | null}) => {

    return (
        <Flex
            direction="column"
            w={{ base: "90%", sm: "300px", md: "350px", lg: "400px" }}
            h="100%"
            px={4}
            marginBottom={"0px"}
            css={{
                "& > *": {
                    marginBottom: "16px",
                },
                "& > *:last-child": {
                    marginBottom: 0,
                },
            }}
        >
            <Box maxHeight={"40vh"}  flex="1" bg="gray.100" borderRadius="md" p={4} boxShadow="sm">
                <Chat messages={chat} onSendMessage={(message) => {
                    sendChat(message);
                }} />
            </Box>

            <Box maxHeight={"15vh"} flex="1" bg="gray.100" borderRadius="md" p={4} boxShadow="sm">
                {
                    timer!=null && (
                        <Timer activeTimer={GlobalBoard.currentSync?.playerToMove} clockPaused={GlobalBoard.currentSync?.clockPaused} timeBlack={timer.blackTime} timeWhite={timer.whiteTime} />
                    )
                }
            </Box>

            <Box height={"40vh"} flex="1" bg="gray.100" borderRadius="md" p={4} boxShadow="sm">
                <MoveHistory moves={
                    moves
                } onNext={() => { }} onPrevious={() => { }} showNavigationButtons={false} />
            </Box>
        </Flex>
    );
};

export default GameRightPanel;
