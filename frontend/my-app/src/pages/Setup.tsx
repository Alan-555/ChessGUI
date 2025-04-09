import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    Input,
    Select,
    Switch,
    Text,
    VStack,
    HStack,
    Stack,
    useColorModeValue,
    background,
} from '@chakra-ui/react';
import { img_b_king, img_w_king } from '../resources';
import { ImageSplit } from '../components/ImageSplit';



const ChessSetup = () => {
    const [side, setSide] = useState<'white' | 'black' | 'random'>('white');
    const [useTimer, setUseTimer] = useState(false);
    const [yourTime, setYourTime] = useState("30");
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [difficulty, setDifficulty] = useState('Beginner');

    const yourTimeRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (useTimer) {
            yourTimeRef.current?.focus();
        }
    }, [useTimer]);


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


    return (
        <Box p={10} maxW="700px" mx="auto">
            <VStack spacing={10}>
                <Text fontSize="6xl" fontWeight="bold">Setup</Text>

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
                                onChange={(e) => setYourTime(e.target.value)}
                            />
                        </Box>
                    </HStack>
                </HStack>

               

                <Box w="full">
                    <Text fontSize="xl" mb={2}>Starting FEN</Text>
                    <Input size="lg" value={fen} onChange={(e) => setFen(e.target.value)} />
                </Box>

                <Box w="full">
                    <Text fontSize="xl" mb={2}>Stockfish difficulty</Text>
                    <Select size="lg" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                        {['Beginner', 'Easy', 'Medium', 'Hard', 'Master'].map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </Select>
                </Box>

                <Button colorScheme="teal" size="lg" fontSize="xl" px={10} py={6}>Start Game</Button>
            </VStack>
        </Box>
    );
};

export default ChessSetup;
