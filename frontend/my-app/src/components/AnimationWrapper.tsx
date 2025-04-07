import { motion } from "framer-motion";
import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

const MotionBox = motion(Box);

export default function AnimatedRouteWrapper({ children }: { children: ReactNode }) {
  return (
    <MotionBox
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      position="absolute"
      top={0}
      left={0}
      width="100%"
      height="100%"
    >
      {children}
    </MotionBox>
  );
}
