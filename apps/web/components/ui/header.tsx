interface HeaderProps {
    text: string;
}

export const Header = ({ text }: HeaderProps) => {
    return <h1 className="text-4xl font-bold tracking-tight text-center mb-5">{text}</h1>;
};
