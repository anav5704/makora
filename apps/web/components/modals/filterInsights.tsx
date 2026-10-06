"use client";

import { parseAsString, useQueryState } from "nuqs";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useModalStore } from "@/stores/modalStore";
import { Color, GamePhase, Platform, Termination, TimeControl } from "@/types/chess";
import { normalizeEnum } from "@/utils/normalizeEnum";

const toOptions = (enumObj: Record<string, string>) => [
    { id: 0, name: "Any", value: null },
    ...Object.values(enumObj).map((value, index) => ({ id: index + 1, name: normalizeEnum(value), value })),
];

const platformOptions = toOptions(Platform);
const colorOptions = toOptions(Color);
const timeControlOptions = toOptions(TimeControl);
const terminationOptions = toOptions(Termination);
const gamePhaseOptions = toOptions(GamePhase);
const reviewedOptions = [
    { id: 0, name: "Any", value: null },
    { id: 1, name: "Yes", value: "true" },
    { id: 2, name: "No", value: "false" },
];

export const FilterInsights = () => {
    const { activeModal } = useModalStore();

    const [platform, setPlatform] = useQueryState("platform", parseAsString);
    const [color, setColor] = useQueryState("color", parseAsString);
    const [timeControl, setTimeControl] = useQueryState("timeControl", parseAsString);
    const [termination, setTermination] = useQueryState("termination", parseAsString);
    const [gamePhase, setGamePhase] = useQueryState("gamePhase", parseAsString);
    const [reviewed, setReviewed] = useQueryState("reviewed", parseAsString);

    return (
        <Modal title="Filter Insights" open={activeModal === "filterInsights"}>
            <div className="grid grid-cols-2 gap-5">
                <Select
                    label="Platform"
                    name="platform"
                    options={platformOptions}
                    selectedItem={platformOptions.find((option) => option.value === platform) ?? platformOptions[0]}
                    setSelectedItem={(item) => setPlatform(item.value)}
                />
                <Select
                    label="Color"
                    name="color"
                    options={colorOptions}
                    selectedItem={colorOptions.find((option) => option.value === color) ?? colorOptions[0]}
                    setSelectedItem={(item) => setColor(item.value)}
                />
                <Select
                    label="Time Control"
                    name="timeControl"
                    options={timeControlOptions}
                    selectedItem={
                        timeControlOptions.find((option) => option.value === timeControl) ?? timeControlOptions[0]
                    }
                    setSelectedItem={(item) => setTimeControl(item.value)}
                />
                <Select
                    label="Termination"
                    name="termination"
                    options={terminationOptions}
                    selectedItem={
                        terminationOptions.find((option) => option.value === termination) ?? terminationOptions[0]
                    }
                    setSelectedItem={(item) => setTermination(item.value)}
                />
                <Select
                    label="Game Phase"
                    name="gamePhase"
                    options={gamePhaseOptions}
                    selectedItem={gamePhaseOptions.find((option) => option.value === gamePhase) ?? gamePhaseOptions[0]}
                    setSelectedItem={(item) => setGamePhase(item.value)}
                />
                <Select
                    label="Reviewed"
                    name="reviewed"
                    options={reviewedOptions}
                    selectedItem={reviewedOptions.find((option) => option.value === reviewed) ?? reviewedOptions[0]}
                    setSelectedItem={(item) => setReviewed(item.value)}
                />
            </div>
        </Modal>
    );
};
