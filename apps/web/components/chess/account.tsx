import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const platforms = [
    { id: 1, name: "Chess.com" },
    { id: 2, name: "Lichess.org" },
];

interface AccountProps {
    selectedPlatform: { id: number; name: string };
    setSelectedPlatform: (platform: { id: number; name: string }) => void;
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
