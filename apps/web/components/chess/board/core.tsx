import "@lichess-org/chessground/assets/chessground.base.css";
import "@lichess-org/chessground/assets/chessground.brown.css";
import "@lichess-org/chessground/assets/chessground.cburnett.css";
import { Chessground } from "@lichess-org/chessground";
import type { Api } from "@lichess-org/chessground/api";
import type { Config } from "@lichess-org/chessground/config";
import type { Color } from "@lichess-org/chessground/types";
import { useEffect, useRef, useState } from "react";

interface BoardProps {
    size: string;
    fen: string;
    orientation: Color;
    onChangeFen?: (fen: string) => void;
    onApiReady?: (api: Api) => void;
    onWheel?: (e: React.WheelEvent<HTMLDivElement>) => void;
    config?: Partial<Config>;
}

export const Core = ({ size, fen, orientation, onChangeFen, onApiReady, onWheel, config }: BoardProps) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [api, setApi] = useState<Api | null>(null);

    useEffect(() => {
        if (!ref.current) return;

        const buildConfig = (overwriteApi?: Api | null): Partial<Config> => ({
            ...config,
            fen,
            orientation,
            coordinates: false,
            draggable: {
                enabled: false,
                ...(config?.draggable ?? {}),
            },
            selectable: {
                enabled: false,
                ...(config?.selectable ?? {}),
            },
            movable: {
                free: false,
                ...(config?.movable ?? {}),
            },
            events: {
                change() {
                    const usedApi = overwriteApi ?? api;
                    const currentFen = usedApi ? usedApi.getFen() : undefined;
                    if (currentFen) onChangeFen?.(currentFen);
                },
                ...(config?.events ?? {}),
            },
            // @ts-expect-error
            addDimensionsCssVarsTo: ref.current,
        });

        if (api) {
            api.set(buildConfig());
            return;
        }

        const chessgroundApi = Chessground(ref.current, buildConfig(null) as Config);
        setApi(chessgroundApi);
        onApiReady?.(chessgroundApi);

        return () => {
            try {
                chessgroundApi.destroy();
            } catch {}
        };
    }, [api, config, fen, orientation, onChangeFen, onApiReady]);

    useEffect(() => {
        if (api && typeof fen === "string") {
            api.set({ fen });
        }
    }, [api, fen]);

    return (
        <div
            ref={ref}
            onWheel={onWheel}
            style={{
                aspectRatio: 1,
                width: size,
            }}
        />
    );
};
