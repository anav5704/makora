"use client";

import {
    ChartArea,
    LayoutDashboard,
    LogOut,
    Settings,
    Swords,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { NavLink } from "@/components/ui/navLink";

export const Sidebar = () => {
    const pathname = usePathname();

    const links = {
        top: [
            {
                label: "Dashboard",
                href: "/dashboard",
                icon: LayoutDashboard,
                isActive: pathname === "/dashboard",
            },
            {
                label: "Games",
                href: "/games",
                icon: Swords,
                isActive: pathname.includes("/games"),
            },
            {
                label: "Insights",
                href: "/insights",
                icon: ChartArea,
                isActive: pathname === "/insights",
            },
        ],
        bottom: [
            {
                label: "Settings",
                href: "/settings",
                icon: Settings,
                isActive: pathname === "/settings",
            },
            {
                label: "Signout",
                href: "/signout",
                icon: LogOut,
                isActive: false,
            },
        ],
    };

    return (
        <nav className="p-5 w-64 flex flex-col justify-between">
            <ul>
                {links.top.map((link) => (
                    <li key={link.href}>
                        <NavLink {...link} />
                    </li>
                ))}
            </ul>
            <ul>
                {links.bottom.map((link) => (
                    <li key={link.href}>
                        <NavLink {...link} />
                    </li>
                ))}
            </ul>
        </nav>
    );
};
