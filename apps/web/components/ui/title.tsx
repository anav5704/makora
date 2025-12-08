interface TitleProps {
    title: string;
}

export const Title = ({ title }: TitleProps) => {
    return <h1 className="p-5 text-4xl font-bold tracking-tight">{title}</h1>;
};
