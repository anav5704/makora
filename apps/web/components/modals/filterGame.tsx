"use client";

import { parseAsString, useQueryState } from "nuqs";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useModalStore } from "@/stores/modalStore";
import { Platform, Termination, TimeControl, GamePhase, Color } from "@/types/chess";
import { normalizeEnum } from "@/utils/normalizeEnum";

const toOptions = (enumObj: Record<string, string>) => [
    { id: 0, name: "Any", value: null },
    ...Object.values(enumObj).map((v, i) => ({ id: i + 1, name: normalizeEnum(v), value: v })),
];

const platformOptions = toOptions(Platform);
const terminationOptions = toOptions(Termination);
const timeControlOptions = toOptions(TimeControl);
const gamePhaseOptions = toOptions(GamePhase);
const colorOptions = toOptions(Color);
const reviewedOptions = [
    { id: 0, name: "Any", value: null },
    { id: 1, name: "Yes", value: "true" },
    { id: 2, name: "No", value: "false" },
];

export const FilterGame = () => {
    const { activeModal  } = useModalStore();

    const [platform, setPlatform] = useQueryState("platform", parseAsString);
    const [termination, setTermination] = useQueryState("termination", parseAsString);
    const [timeControl, setTimeControl] = useQueryState("timeControl", parseAsString);
  const [gamePhase, setGamePhase] = useQueryState("gamePhase", parseAsString);
    const [color, setColor] = useQueryState("color", parseAsString);
    const [reviewed, setReviewed] = useQueryState("reviewed", parseAsString);

    return (
        <Modal title="Filter Games" open={activeModal === "filterGame"}>
          <div className="grid grid-cols-2 gap-5">
            <Select
                label="Platform"
                name="platform"
                options={platformOptions}
                selectedItem={platformOptions.find((o) => o.value === platform) ?? platformOptions[0]}
                setSelectedItem={(item) => setPlatform(item.value)}
            />
            <Select
                label="Termination"
                name="termination"
                options={terminationOptions}
                selectedItem={terminationOptions.find((o) => o.value === termination) ?? terminationOptions[0]}
                setSelectedItem={(item) => setTermination(item.value)}
            />
            <Select
                label="Time Control"
                name="timeControl"
                options={timeControlOptions}
                selectedItem={timeControlOptions.find((o) => o.value === timeControl) ?? timeControlOptions[0]}
                setSelectedItem={(item) => setTimeControl(item.value)}
            />
             <Select
                label="Game Phase"
                name="gamePhase"
                options={gamePhaseOptions}
                selectedItem={gamePhaseOptions.find((o) => o.value === gamePhase) ?? gamePhaseOptions[0]}
                setSelectedItem={(item) => setGamePhase(item.value)}
            />
            <Select
                label="Color"
                name="color"
                options={colorOptions}
                selectedItem={colorOptions.find((o) => o.value === color) ?? colorOptions[0]}
                setSelectedItem={(item) => setColor(item.value)}
            />
            <Select
                label="Reviewed"
                name="reviewed"
                options={reviewedOptions}
                selectedItem={reviewedOptions.find((o) => o.value === reviewed) ?? reviewedOptions[0]}
                setSelectedItem={(item) => setReviewed(item.value)}
            />
          </div>
        </Modal>
    );
};
