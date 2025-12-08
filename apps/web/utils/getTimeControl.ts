import { Flame, Hourglass, Timer, Zap } from "lucide-react";
import { TimeControl } from "@/types/chess";

export const getTimeControl = (timeControl: TimeControl): { icon: typeof Zap; title: string } => {
    switch (timeControl) {
        case TimeControl.BULLET:
            return { icon: Zap, title: "Bullet" };
        case TimeControl.BLITZ:
            return { icon: Flame, title: "Blitz" };
        case TimeControl.RAPID:
            return { icon: Timer, title: "Rapid" };
        case TimeControl.CLASSICAL:
            return { icon: Hourglass, title: "Classical" };
        default:
            return { icon: Timer, title: "Unknown" };
    }
};
