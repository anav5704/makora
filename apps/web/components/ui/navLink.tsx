import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface NavLinkProps {
    label: string;
    href: string;
    icon: LucideIcon;
    isActive: boolean;
}

export const NavLink = ({ label, href, icon: Icon, isActive }: NavLinkProps) => {
    return (
        <Link
            href={{ pathname: href }}
            className={`${isActive && "bg-violet-500"} flex gap-3 p-3 rounded-md transition`}>
            <Icon size={24} />
            {label}
        </Link>
    );
};
