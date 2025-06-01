// LeaveButton.tsx
import React from "react";
import { Box, Button, Flex, useBoolean } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const MotionFlex = motion(Flex);

interface LeaveButtonProps {
    onResign: () => void;
    onOfferDraw: () => void;
}

export const GameLeaveButton: React.FC<LeaveButtonProps> = ({
    onResign,
    onOfferDraw,
}) => {
    const [isHovered, setHovered] = useBoolean();

    return (
        <Box

            zIndex={1000}
            onMouseEnter={setHovered.on}
            onMouseLeave={setHovered.off}
            cursor="unset"
            userSelect="none"
        >
            <MotionFlex
                align="center"
                overflow="hidden"
                bg="red.500"
                borderRadius="md"
                height="56px"

                zIndex={1000}
                transition={{ width: { duration: 0.25, ease: "easeInOut" } }}
            >
                <Button

                    zIndex={1000}
                    flexShrink={0}
                    w="56px"
                    h="56px"
                    p={0}
                    colorScheme="red"
                    variant="solid"
                    pointerEvents={"none"}
                    _hover={
                        {}
                    }
                >
                    Leave
                </Button>

                <AnimatePresence>
                    {isHovered && (
                        <MotionFlex

                            zIndex={1000}
                            align="center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            ml={3}
                            pr={3}
                            gap={2}
                        >
                            <Button size="sm" colorScheme="red" onClick={onResign} zIndex={1000}>
                                Resign
                            </Button>
                            <Button size="sm" colorScheme="blue" onClick={onOfferDraw} zIndex={1000}>
                                Offer Draw
                            </Button>
                        </MotionFlex>
                    )}
                </AnimatePresence>
            </MotionFlex>
        </Box>
    );
};
