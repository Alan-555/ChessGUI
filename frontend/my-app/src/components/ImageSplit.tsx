import { Box, Image } from "@chakra-ui/react";

interface ImageSplitProps {
  topLeftSrc: string;      // URL string from import
  bottomRightSrc: string;  // URL string from import
  width?: string;
  height?: string;
}

export const ImageSplit: React.FC<ImageSplitProps> = ({
  topLeftSrc,
  bottomRightSrc,
  width = "300px",
  height = "300px",
}) => {
  return (
    <Box position="relative" width={width} height={height} overflow="hidden">
      {/* Top-left half */}
      <Image
        src={topLeftSrc}
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        objectFit="cover"
        style={{
          clipPath: "polygon(0 0, 100% 0, 0 100%)"
        }}
      />

      {/* Bottom-right half */}
      <Image
        src={bottomRightSrc}
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        objectFit="cover"
        style={{
          clipPath: "polygon(100% 100%, 100% 0, 0 100%)"
        }}
      />
    </Box>
  );
};
