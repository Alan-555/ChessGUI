import React, { useEffect, useRef } from "react";
import { Image } from "@chakra-ui/react";
import { GetRenderSize, useGlobalConfig } from "../providers/GlobalConfigProvider";
import { DragContext } from "./ChessBoard";

const PieceDrag = ({
    dragContext,
    setDragContext,
    onTrueDrag
}: {
    dragContext: DragContext;
    setDragContext: (
        newContext: DragContext,
        dropPos: { x: number; y: number }) => void;
    onTrueDrag: () => void
}
) => {
    const globalCfg = useGlobalConfig();
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if(!dragContext.trueDrag){
                onTrueDrag(); //Once an actual drag is detected, deselect square
                dragContext.trueDrag = true;
            }
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
                left: -100,
                top: -100,
                transform: "translate(-50%, -50%)",
                width: `${GetRenderSize()}`,
                height: `${GetRenderSize()}`,
                zIndex: 9999,
            }}
            onMouseUp={(e) => {
                e.preventDefault();
                setDragContext({
                    isDragging: false,
                    piece: null,
                },
                    { x: e.clientX, y: e.clientY });
            }}
        />
    );
};

export default PieceDrag;
