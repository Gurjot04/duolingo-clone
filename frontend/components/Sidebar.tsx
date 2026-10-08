"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLearn, NavLeague, NavMore, NavProfile, NavQuests, NavShop } from "./Icons";

const ITEMS = [
  { href: "/", label: "LEARN", Icon: NavLearn },
  { href: "/leaderboard", label: "LEADERBOARDS", Icon: NavLeague },
  { href: "/quests", label: "QUESTS", Icon: NavQuests },
  { href: "/shop", label: "SHOP", Icon: NavShop },
  { href: "/profile", label: "PROFILE", Icon: NavProfile },
  { href: "/settings", label: "MORE", Icon: NavMore },
];

export default function Sidebar() {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <>
      <nav className="sidebar">
        <Link href="/" className="logo">Duo<span>lingo</span></Link>
        {ITEMS.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={`nav-item ${isActive(href) ? "active" : ""}`}>
            <Icon size={32} /><span>{label}</span>
          </Link>
        ))}
      </nav>
      <nav className="bottom-nav">
        {ITEMS.filter((i) => i.href !== "/settings").map(({ href, label, Icon }) => (
          <Link key={href} href={href} aria-label={label} className={`bn-item ${isActive(href) ? "active" : ""}`}>
            <Icon size={30} />
          </Link>
        ))}
      </nav>
    </>
  );
}
