import { Button, Portal } from "@chakra-ui/react";
import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { chakra } from "@chakra-ui/react";
const MotionBox = chakra(motion.div);
export const Overlay = ({ onClose, show, children, styles, hideConfirm, buttonText }: { onClose?: () => void, show: boolean, children: ReactNode, styles?: React.CSSProperties, hideConfirm?: boolean, buttonText? : string}) => {

  return (
    <AnimatePresence>
      {show && (
        <Portal>

          <MotionBox
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            zIndex={999}
            display="flex"
            alignItems="center"
            justifyContent="center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <MotionBox
              bg="white"
              p={6}
              borderRadius="md"
              boxShadow="lg"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { duration: 0.3 } }}
              exit={{ scale: 0.1, opacity: 0, transition: { duration: 0.5 } }}
              style={styles}
            >
              {children}

              {!hideConfirm && (

                <Button
                  mt={4}
                  onClick={onClose}
                  marginTop="10px"
                  colorScheme="teal"
                  width={"100%"}
                >
                  {buttonText || "Confirm"}
                </Button>
              )}
            </MotionBox>
          </MotionBox>
        </Portal>
      )}
    </AnimatePresence>
  );
};