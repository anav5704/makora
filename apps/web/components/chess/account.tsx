import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Platform } from "@/types/chess";

const platforms = [
    { id: 1, name: "Chess.com", value: Platform.CHESS_COM },
    { id: 2, name: "Lichess.org", value: Platform.LICHESS_ORG },
];

interface AccountProps {
    selectedPlatform: { id: number; name: string; value: Platform };
    setSelectedPlatform: (platform: { id: number; name: string; value: Platform }) => void;
    username: string;
    setUsername: (username: string) => void;
}

export const Account = ({
    selectedPlatform,
    setSelectedPlatform,
    username,
    setUsername,
}: AccountProps) => {
    return (
        <>
            <Select
                options={platforms}
                selectedItem={selectedPlatform}
                setSelectedItem={setSelectedPlatform}
                label="Platform"
                id="platform"
                name="platform"
            />
            <Input
                type="text"
                label="Username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
        </>
    );
};

export { platforms };
