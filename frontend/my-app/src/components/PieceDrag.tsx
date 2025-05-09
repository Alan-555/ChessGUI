import React, { useEffect, useRef } from "react";
import { Image } from "@chakra-ui/react";
import { useGlobalConfig } from "../providers/GlobalConfigProvider";
import { DragContext } from "../engine/ChessBoardLogic";

const PieceDrag = ({
  dragContext,
  setDragContext,
}: {
  dragContext: DragContext;
  setDragContext: (
    newContext: DragContext,
    dropPos: { x: number; y: number })=>void;
}) => {
  const globalCfg = useGlobalConfig();
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (imageRef.current) {
        imageRef.current.style.left = `${e.clientX}px`;
        imageRef.current.style.top = `${e.clientY}px`;
      }
    };

    if (dragContext.isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [dragContext.isDragging]);

  if (!dragContext.isDragging || !dragContext.piece) return null;

  return (
    <Image
      ref={imageRef}
      src={dragContext.piece.imgSrc}
      alt="Follower"
      position="fixed"
      style={{
        left: 0,
        top: 0,
        transform: "translate(-50%, -50%)",
        width: `${globalCfg.render.imgSize}px`,
        height: `${globalCfg.render.imgSize}px`,
        zIndex: 9999,
      }}
      onMouseUp={(e) => {
        e.preventDefault();
        setDragContext({
          isDragging: false,
          piece: null,
        },
        { x: e.clientX, y: e.clientY});
      }}
    />
  );
};

export default PieceDrag;
