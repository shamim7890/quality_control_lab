// @/components/Sidebar.tsx
"use client"

import React, { useState } from 'react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    ChevronDown,
    LayoutDashboard,
    Package,
    ChevronsLeft,
    ChevronsRight,
    TestTube,
    Truck,
    Users,
    History,
    FlaskConical,
    Microscope,
    Building2,
    FileText,
    Database,
    Beaker,
    Atom,
    UserPlus,
    Archive,
    ClipboardList,
    Settings,
    Home
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { LucideIcon } from 'lucide-react'

// Define types
type Role = 'analyst' | 'technical_manager_c' | 'technical_manager_m' | 'senior_assistant_director' | 'quality_assurance_manager' | 'store_officer' | 'admin'

interface SubItem {
    title: string
    href: string
    icon?: LucideIcon
    roles?: Role[]
}

interface SidebarItem {
    title: string
    icon: LucideIcon
    href: string
    group: string
    roles?: Role[]
    subItems?: SubItem[]
}

const sidebarItems: SidebarItem[] = [
    {
        title: "Home",
        icon: Home,
        href: "/",
        group: "Navigation",
        roles: ['analyst', 'technical_manager_c', 'technical_manager_m', 'senior_assistant_director', 'quality_assurance_manager', 'store_officer', 'admin']
    },
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        group: "Overview",
        roles: ['analyst', 'technical_manager_c', 'technical_manager_m', 'senior_assistant_director', 'quality_assurance_manager', 'store_officer', 'admin']
    },
    {
        title: "Store Items",
        icon: FlaskConical,
        href: "/raw_inventory",
        group: "Inventory",
        roles: ['store_officer', 'admin'],
        subItems: [
            { title: "Add Items", href: "/add_products", icon: Atom },
            { title: "View Items", href: "/add_products/history", icon: Database },
        ],
    },
    {
        title: "Suppliers",
        icon: Truck,
        href: "/supplier",
        group: "Inventory",
        roles: ['store_officer', 'admin'],
        subItems: [
            { title: "Add Supplier", href: "/supplier", icon: UserPlus },
            { title: "All Suppliers", href: "/supplier/history", icon: Users },
        ],
    },
    {
        title: "Store",
        icon: Building2,
        href: "/process_inventory",
        group: "Storage",
        roles: ['store_officer', 'admin'],
        subItems: [
            { title: "Add Chemicals", href: "/store/chemical", icon: Beaker },
            { title: "Add Execories", href: "/store/execories", icon: Archive },
            { title: "Chemical items", href: "/store/chemical/items", icon: FlaskConical },
            { title: "Execorie items", href: "/store/execories/items", icon: FileText },
        ],
    },
    {
        title: "Chemical Requisitions",
        icon: ClipboardList,
        href: "/requisitions",
        group: "Requisitions",
        roles: ['analyst', 'technical_manager_c', 'technical_manager_m', 'senior_assistant_director', 'quality_assurance_manager', 'store_officer', 'admin'],
        subItems: [
            { 
                title: "New Requisition", 
                href: "/requisitions/chemicals/new", 
                icon: FileText,
                roles: ['analyst', 'store_officer', 'admin']
            },
            { 
                title: "View All", 
                href: "/requisitions/chemicals", 
                icon: Database,
                roles: ['analyst', 'technical_manager_c', 'technical_manager_m', 'senior_assistant_director', 'quality_assurance_manager', 'store_officer', 'admin']
            },
        ],
    },
    {
        title: "Execories Requisitions",
        icon: Package,
        href: "/admin-requisitions",
        group: "Requisitions",
        roles: ['analyst', 'technical_manager_c', 'technical_manager_m', 'senior_assistant_director', 'quality_assurance_manager', 'store_officer', 'admin'],
        subItems: [
            { 
                title: "New Requisition", 
                href: "/requisitions/execories/new", 
                icon: FileText,
                roles: ['analyst', 'store_officer', 'admin']
            },
            { 
                title: "View All", 
                href: "/requisitions/execories", 
                icon: Database,
                roles: ['analyst', 'technical_manager_c', 'technical_manager_m', 'senior_assistant_director', 'quality_assurance_manager', 'store_officer', 'admin']
            },
        ],
    },    
    {
        title: "History & Reports",
        icon: History,
        href: "/History",
        group: "Operations",
        roles: ['store_officer', 'admin'],
        subItems: [
            { title: "Chemicals", href: "/history/chemicals", icon: FlaskConical },
            { title: "Execories", href: "/history/execories", icon: Microscope },
            { title: "Expiring Items", href: "/expiring-items", icon: TestTube },
        ],
    },
    {
        title: "Admin Panel",
        icon: Settings,
        href: "/admin",
        group: "System",
        roles: ['admin']
    },
]

export function AppSidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()
    const { user } = useUser()
    const role = user?.publicMetadata?.role as Role | undefined

    // Filter items based on user role
    const filterItemsByRole = (items: SidebarItem[]): SidebarItem[] => {
        return items.filter(item => {
            if (!item.roles) return true
            if (!role) return false
            return item.roles.includes(role)
        }).map(item => {
            if (item.subItems) {
                return {
                    ...item,
                    subItems: item.subItems.filter(subItem => {
                        if (!subItem.roles) return true
                        if (!role) return false
                        return subItem.roles.includes(role)
                    })
                }
            }
            return item
        })
    }

    const filteredItems = filterItemsByRole(sidebarItems)

    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.group]) {
            acc[item.group] = []
        }
        acc[item.group].push(item)
        return acc
    }, {} as Record<string, SidebarItem[]>)

    const getRoleBadge = () => {
        const roleLabels: Record<Role, { label: string; color: string }> = {
            analyst: { label: 'Analyst', color: 'bg-blue-600' },
            technical_manager_c: { label: 'TM (C)', color: 'bg-green-600' },
            technical_manager_m: { label: 'TM (M)', color: 'bg-green-700' },
            senior_assistant_director: { label: 'SAD', color: 'bg-yellow-600' },
            quality_assurance_manager: { label: 'QA Manager', color: 'bg-purple-600' },
            store_officer: { label: 'Store Officer', color: 'bg-orange-600' },
            admin: { label: 'Admin', color: 'bg-red-600' }
        }

        const roleInfo = role ? roleLabels[role] : null
        if (!roleInfo) return null

        return (
            <div className={`${roleInfo.color} px-2 py-1 rounded text-xs font-semibold text-white text-center mt-2`}>
                {roleInfo.label}
            </div>
        )
    }

    return (
        <div className={cn(
            "bg-slate-900 text-white border-r border-slate-800 h-full transition-all duration-300 ease-in-out print:hidden flex flex-col",
            isCollapsed ? "w-20" : "w-80",
            className
        )}>

            {/* Header */}
            <div className={cn(
                "flex items-center justify-between p-4 border-b border-slate-800 transition-all duration-300",
                "h-24"
            )}>
                {!isCollapsed && (
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 shrink-0">
                            <TestTube className="h-7 w-7 text-cyan-400" />
                        </div>
                        <div>
                            <div className="font-bold text-xl text-white">
                                Quality Control Laboratory
                            </div>
                            <div className="text-base text-slate-400">Store Management</div>
                        </div>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-10 w-10 hover:bg-slate-800 text-slate-400 hover:text-white shrink-0 rounded-lg"
                >
                    {isCollapsed ?
                        <ChevronsRight className="h-6 w-6" /> :
                        <ChevronsLeft className="h-6 w-6" />
                    }
                </Button>
            </div>

            {/* User Info */}
            <SignedIn>
                <div className={cn(
                    "p-4 border-b border-slate-800",
                    isCollapsed ? "flex justify-center" : ""
                )}>
                    {isCollapsed ? (
                        <UserButton afterSignOutUrl="/" />
                    ) : (
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <UserButton afterSignOutUrl="/" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'User'}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                        {user?.emailAddresses?.[0]?.emailAddress}
                                    </p>
                                </div>
                            </div>
                            {getRoleBadge()}
                        </div>
                    )}
                </div>
            </SignedIn>

            {/* Content */}
            <ScrollArea className="flex-1 p-2">
                <SignedIn>
                    {Object.entries(groupedItems).map(([group, items]) => (
                        <div key={group} className="mb-4">
                            {!isCollapsed && (
                                <div className="text-sm font-semibold text-slate-500 px-3 mt-4 mb-2 uppercase tracking-wider">
                                    {group}
                                </div>
                            )}
                            <div className="space-y-1">
                                {items.map((item) => (
                                    <div key={item.title}>
                                        {item.subItems && item.subItems.length > 0 ? (
                                            <Collapsible>
                                                <CollapsibleTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className={cn(
                                                            "w-full justify-start h-12 transition-colors duration-200 rounded-lg",
                                                            "text-slate-300 hover:bg-slate-800 hover:text-white",
                                                            pathname.startsWith(item.href) && "bg-slate-800 text-white",
                                                            isCollapsed ? "px-2.5 justify-center" : "px-4"
                                                        )}
                                                    >
                                                        <div className="flex items-center w-full">
                                                            <item.icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-4")} />
                                                            {!isCollapsed && (
                                                                <>
                                                                    <span className="text-base font-medium">{item.title}</span>
                                                                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                                                                </>
                                                            )}
                                                        </div>
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    {!isCollapsed && (
                                                        <div className="ml-6 mt-1 space-y-1 border-l border-slate-700 pl-5">
                                                            {item.subItems.map((subItem) => (
                                                                <Button
                                                                    key={subItem.href}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    asChild
                                                                    className={cn(
                                                                        "w-full justify-start h-10 text-base transition-colors duration-200 rounded-md",
                                                                        "text-slate-400 hover:bg-slate-800 hover:text-white",
                                                                        pathname === subItem.href && "text-white bg-slate-800"
                                                                    )}
                                                                >
                                                                    <Link href={subItem.href} className="flex items-center">
                                                                        {subItem.icon && <subItem.icon className="h-4 w-4 mr-4" />}
                                                                        <span className="font-normal text-base">{subItem.title}</span>
                                                                    </Link>
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CollapsibleContent>
                                            </Collapsible>
                                        ) : (
                                            <Button
                                                asChild
                                                variant="ghost"
                                                className={cn(
                                                    "w-full justify-start h-12 transition-colors duration-200 rounded-lg",
                                                    "text-slate-300 hover:bg-slate-800 hover:text-white",
                                                    pathname === item.href && "bg-slate-800 text-white",
                                                    isCollapsed ? "px-2.5 justify-center" : "px-4"
                                                )}
                                            >
                                                <Link href={item.href} className="flex items-center">
                                                    <item.icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-4")} />
                                                    {!isCollapsed && <span className="text-base font-medium">{item.title}</span>}
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </SignedIn>

                <SignedOut>
                    {!isCollapsed && (
                        <div className="p-4">
                            <p className="text-slate-400 text-sm mb-4 text-center">
                                Please sign in to access the portal
                            </p>
                        </div>
                    )}
                </SignedOut>
            </ScrollArea>

            {/* Auth Buttons */}
            <div className="p-4 border-t border-slate-800 mt-auto">
                <SignedOut>
                    {isCollapsed ? (
                        <div className="flex flex-col gap-2">
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="icon" className="w-full h-10 hover:bg-slate-800">
                                    <Users className="h-5 w-5" />
                                </Button>
                            </SignInButton>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <SignInButton mode="modal">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    Sign In
                                </Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                    Sign Up
                                </Button>
                            </SignUpButton>
                        </div>
                    )}
                </SignedOut>

                <SignedIn>
                    {!isCollapsed && (
                        <div className="text-xs text-slate-500 text-center">
                            <p>© 2025 QC Laboratory</p>
                            <p className="mt-1">v2.0</p>
                        </div>
                    )}
                </SignedIn>
            </div>
        </div>
    )
}