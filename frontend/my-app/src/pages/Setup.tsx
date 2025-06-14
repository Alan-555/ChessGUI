import { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    Input,
    Select,
    Switch,
    Text,
    VStack,
    HStack,
    useToast,
} from '@chakra-ui/react';
import { img_b_king, img_w_king } from '../resources';
import { ImageSplit } from '../components/ImageSplit';
import { GameConfig, GameMode } from '../providers/GameConfigProvider';
import { GlobalBoard } from '../pages/Game';
import { Overlay } from '../components/Overlay';
import { ValidateFEN, PieceColor } from '../engine/ChessBoardLogic';
import GameRaw from './GameRaw';
import LoadingScreen from '../components/ConnectToServer';
import { ServerSync } from '../engine/ServerSync';
import { number } from 'framer-motion';



function ChessSetup({ mode }: { mode: GameMode }) {
    const [side, setSide_] = useState<'white' | 'black' | 'random'>('white');
    const [actualSide, setActualSide] = useState<PieceColor>('white');
    const [useTimer, setUseTimer] = useState(false);
    const [yourTime, setYourTime] = useState("20");
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [difficulty, setDifficulty] = useState('0');

    const [isLoad, startLoad] = useState(false);

    const yourTimeRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (useTimer) {
            yourTimeRef.current?.focus();
        }
    }, [useTimer]);

    const [isOpen, setIsOpen] = useState(false);

    const toast = useToast();

    const setSide = (newSide: 'white' | 'black' | 'random') => {
        setSide_(newSide);
        if (newSide === 'white') {
            setActualSide('white');
        } else if (newSide === 'black') {
            setActualSide('black');
        } else {
            setActualSide(Math.random() < 0.5 ? 'white' : 'black');
        }
    }
    const validateFen = (strict : boolean = true) => {
        let fen_ = ValidateFEN(fen,strict);
        if (fen_) {
            toast({
                title: "Invalid FEN",
                description: fen_,
                status: "error",
                duration: 4000,
                isClosable: true,
            })
            return false;
        }
        return true;
    }

    const styleSelected = {
        border: '2px solid white',
        boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.4)',
        background: 'rgba(227, 227, 227, 0.77)',
        transform: 'scale(1.05)',
        _hover: {
            background: 'rgba(227, 227, 227, 0.77)',
            transform: 'scale(1.05)',
        }
    }
    const styleUnselected = {
        border: '2px solid transparent',
        boxShadow: 'none',
        background: 'rgba(210, 210, 210, 0.75)',
        transform: 'scale(1)',
        _hover: {
            transform: 'scale(1.05)',
        }
    };
    let config: GameConfig = {
        GameMode: mode,
        onlineThisPlayer: actualSide,
        startPosition: fen,
        time: useTimer ? Number.parseInt(yourTime) * 1000 * 60 : 0,
        sfDifficulty: mode === "PLAY_LOCAL_AI" ? Number.parseInt(difficulty) : undefined
    }



    let setupBoardCfg: GameConfig = {
        GameMode: "BOARD_SETUP",
        onlineThisPlayer: 'white',
        startPosition: fen
    }

    return (
        <>
            <Box p={10} maxW="700px" mx="auto" overflowY="auto" maxHeight="100vh">
                <VStack spacing={10}>
                    <Text textAlign={"center"} fontSize="4xl" fontWeight="bold">{
                        mode === "PLAY_LOCAL_AI" ? "Set up Game Against Stockfish" :
                            mode === "PLAY_LOCAL_HUMAN" ? "Set up Local Game" :
                                mode === "PLAY_ONLINE_HOST" ? "Set up an Online Game" : "SETUP"
                    }</Text>

                    <Box>
                        <Text fontSize="2xl" mb={4}>Pick your side</Text>
                        <HStack height={"20vh"} spacing={6}>
                            <Button
                                onClick={() => setSide('white')}
                                style={side === 'white' ? styleSelected : styleUnselected}
                                color="white"
                                fontSize="4xl"
                                p={6}
                                height={"20vh"}
                                width={"20vh"}
                            >
                                <img src={img_w_king} alt="White King" style={{ height: '100%', width: '100%' }} />
                            </Button>
                            <Button
                                onClick={() => setSide('black')}
                                style={side === 'black' ? styleSelected : styleUnselected}
                                color="white"
                                fontSize="4xl"
                                p={6}
                                height={"20vh"}
                                width={"20vh"}
                            >
                                <img src={img_b_king} alt="Black King" style={{ height: '100%', width: '100%' }} />
                            </Button>
                            <Button
                                onClick={() => setSide('random')}
                                style={side === 'random' ? styleSelected : styleUnselected}
                                color="white"
                                fontSize="xl"
                                p={6}
                                height={"20vh"}
                                width={"20vh"}
                            >
                                <ImageSplit height='18vh' width='18vh' topLeftSrc={img_w_king} bottomRightSrc={img_b_king}></ImageSplit>
                            </Button>
                        </HStack>
                    </Box>

                    <HStack alignItems="center" spacing={6}>
                        <Text fontSize="2xl">Timer</Text>
                        <Switch size="lg" isChecked={useTimer} onChange={(e) => setUseTimer(e.target.checked)} />
                        <HStack spacing={6} opacity={useTimer ? '1' : '0.5'} pointerEvents={useTimer ? 'auto' : 'none'}>
                            <Box>
                                <Input
                                    ref={yourTimeRef}
                                    size="lg"
                                    placeholder="Minutes"
                                    value={yourTime}
                                    type='number'
                                    onChange={(e) =>{ setYourTime(Math.floor(number.parse(e.target.value)).toString())}}
                                    onBlur={e=>{if((e.currentTarget.value===""|| e.currentTarget.value==="0") &&useTimer)setUseTimer(false)}}
                                />
                            </Box>
                        </HStack>
                    </HStack>



                    <Box w="full">
                        <Text fontSize="xl" mb={2}>Starting FEN</Text>
                        <Input marginRight={"10px"} width={"80%"} size="lg" value={fen} onChange={(e) => setFen(e.target.value)} />
                        <Button
                            onClick={() => {
                                if (!validateFen(false)) return;
                                setIsOpen(true);
                                GlobalBoard.InitBoard(config.startPosition, true);
                            }}
                            colorScheme="blue"
                            size="lg"
                            fontSize="xl"
                            px={10}

                            width={"10%"}
                        >
                            ✏️
                        </Button>
                    </Box>
                    <Box w="full">

                    </Box>
                    {mode === "PLAY_LOCAL_AI" && (
                        <Box w="full">
                            <Text fontSize="xl" mb={2}>Stockfish difficulty</Text>
                            <Select size="lg" value={difficulty} onChange={(e) => setDifficulty(e.currentTarget.value)}>
                                {[['Beginner (500)', 500], ['Intermediate (1000)', 1000], ['Skilled (1500)', 1500], ['Experienced (2000)', 2000], ['Master (3000)', 3000]].map(level => (
                                    <option key={level[0]} value={level[1]}>{level[0]}</option>
                                ))}
                            </Select>
                        </Box>
                    )}

                    <Button onClick={() => { if (!validateFen()) return; startLoad(true) }} colorScheme="teal" size="lg" fontSize="xl" px={10} py={6}>Start Game</Button>
                </VStack>
            </Box>
            <Overlay show={isOpen} onClose={() => {
                let fen_ = GlobalBoard.CreateFen();
                const oldAppend = fen.split(" ").slice(1);
                if (oldAppend.length > 0) {
                    fen_ += " " + oldAppend.join(" ");
                }
                setFen(fen_);
                setIsOpen(false);

            }}>
                <GameRaw gameConfig={setupBoardCfg} />
            </Overlay>
            <Overlay buttonText='Cancel' show={isLoad} hideConfirm={false} onClose={() => { startLoad(false); ServerSync.Instance.Quit("User aborted connection") }}>
                <LoadingScreen config={config}
                    abort={
                        (t, d) => {
                            startLoad(false);
                            toast({
                                title: t,
                                description: d,
                                status: "error",
                                duration: 5000,
                                isClosable: true,
                            })
                        }
                    }
                />
            </Overlay>

        </>

    );
};

export default ChessSetup;
