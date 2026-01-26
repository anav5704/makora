"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { type Dispatch, type SetStateAction, useCallback, useEffect } from "react";

interface ControlsProps {
    positions?: string[];
    moveIndex?: number;
    onNavigate?: (index: number) => void;
    setMoveIndex?: Dispatch<SetStateAction<number>>;
}

export const Controls = ({ positions = [], moveIndex = 0, onNavigate, setMoveIndex }: ControlsProps) => {
    const goStart = useCallback(() => {
        onNavigate?.(0);
        setMoveIndex?.(0);
    }, [onNavigate, setMoveIndex]);

    const goPrev = useCallback(() => {
        if (moveIndex > 0) {
            const next = moveIndex - 1;
            onNavigate?.(next);
            setMoveIndex?.((prev: number) => prev - 1);
        }
    }, [onNavigate, setMoveIndex, moveIndex]);

    const goNext = useCallback(() => {
        if (moveIndex < positions.length - 1) {
            const next = moveIndex + 1;
            onNavigate?.(next);
            setMoveIndex?.((prev: number) => prev + 1);
        }
    }, [onNavigate, setMoveIndex, moveIndex, positions]);

    const goEnd = useCallback(() => {
        const endIndex = positions.length - 1;
        onNavigate?.(endIndex);
        setMoveIndex?.(() => endIndex);
    }, [onNavigate, setMoveIndex, positions.length]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case "ArrowRight":
                case " ":
                case "d":
                case "D":
                    goNext();
                    break;
                case "ArrowLeft":
                case "a":
                case "A":
                    goPrev();
                    break;
                case "ArrowUp":
                case "w":
                case "W":
                    goStart();
                    break;
                case "ArrowDown":
                case "s":
                case "S":
                    goEnd();
                    break;
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [goNext, goPrev, goStart, goEnd]);

    return (
        <div className="flex">
            <button className="w-1/4 cursor-pointer p-5" type="button" onClick={goStart} title="Go to start">
                <ChevronsLeft className="mx-auto" size={24} />
            </button>
            <button className="w-1/4 cursor-pointer p-5" type="button" onClick={goPrev} title="Previous">
                <ChevronLeft className="mx-auto" size={24} />
            </button>
            <button className="w-1/4 cursor-pointer p-5" type="button" onClick={goNext} title="Next">
                <ChevronRight className="mx-auto" size={24} />
            </button>
            <button className="w-1/4 cursor-pointer p-5" type="button" onClick={goEnd} title="Go to end">
                <ChevronsRight className="mx-auto" size={24} />
            </button>
        </div>
    );
};
