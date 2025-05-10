import { Box, Button, Portal } from "@chakra-ui/react";
import { ReactNode, useState } from "react";

export const Overlay = ({ onClose, children }: { onClose: () => void, children: ReactNode }) => {
  return (
    <Portal>

      <Box
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
      >
        <Box bg="white" p={6} borderRadius="md" boxShadow="lg">

          {children}
          <Button
            mt={4}
            onClick={onClose}
            marginTop="-10%"
            backgroundColor={"#a1ff9e"}
            width={"100%"}
          >
            Confirm
          </Button>

        </Box>
      </Box>
    </Portal>
  );
};