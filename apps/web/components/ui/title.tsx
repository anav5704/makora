interface TitleProps {
    title: string;
}

export const Title = ({ title }: TitleProps) => {
    return <h1 className="text-4xl font-bold tracking-tight mb-5">{title}</h1>;
};
