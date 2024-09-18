// app/components/Navigation.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HomeIcon, UserIcon, FolderIcon, MailIcon } from "lucide-react"

const navItems = [
  { href: "#home", icon: HomeIcon, label: "Home" },
  { href: "#about", icon: UserIcon, label: "About" },
  { href: "/projects", icon: FolderIcon, label: "Projects" },
  { href: "#contact", icon: MailIcon, label: "Contact" },
]

const NavBar: React.FC = () => {
  return (
    <nav className="fixed left-4 top-1/2 -translate-y-1/2 z-10">
      <div className="flex flex-col items-center space-y-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-full py-4 px-2">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className="text-white hover:text-gray-300 transition-colors">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Icon className="h-6 w-6" />
              <span className="sr-only">{label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default NavBar