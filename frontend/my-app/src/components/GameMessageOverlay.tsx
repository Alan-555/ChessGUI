import { Fade, Box, ScaleFade } from "@chakra-ui/react";

interface OverlayProps {
  show: boolean;
  children: React.ReactNode;
}

export const GameMessageOverlay: React.FC<OverlayProps> = ({ show, children }) => {
  return (
    <Fade in={show}>
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        bg={"rgba(0,0,0,0.1)"}
        justifyContent="center"
        zIndex={1000}
        pointerEvents={show ? "all" : "none"}
      >
        <ScaleFade initialScale={0.9} in={show}>
          <Box
            bg="white"
            p={6}
            borderRadius="md"
            boxShadow="lg"
            maxW="90%"
            textAlign="center"
          >
            {children}
          </Box>
        </ScaleFade>
      </Box>
    </Fade>
  );
};
