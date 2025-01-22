"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const t = useTranslations()
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const handleLogout = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Logout failed")
      }

      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          {/* Left side - can add logo or other content */}
          <div />

          {/* Right side - user menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{t("navbar.profile")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleLogout}
                disabled={loading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{loading ? "..." : t("navbar.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
