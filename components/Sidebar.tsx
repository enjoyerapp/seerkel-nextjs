'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    Home,
    Search,
    User,
    Menu,
    X,
    LogOut
} from 'lucide-react';
import FilledButton from './FilledButton';
import { useUid } from "@/context/UserContext"

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { uid, setUid } = useUid()

    const navItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/search', label: 'Search', icon: Search },
    ];

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    const closeSidebar = () => setIsOpen(false);

    async function logout() {
        await fetch("/api/logout", { method: "POST" })
        setUid(null)
    }

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-black border border-gray-800 rounded-lg hover:bg-gray-900 transition"
                aria-label="Toggle menu"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed lg:static inset-y-0 left-0 z-40
                    w-60 bg-black border-r border-gray-800 flex flex-col p-4
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0 pt-18 lg:pt-6' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center mb-8 px-2" onClick={closeSidebar}>
                    <img className="w-40 h-auto" src="/logo_seerkel.webp" alt="Logo" />
                </Link>

                {/* Navigation */}
                <nav className="flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeSidebar}
                                className={`flex items-center space-x-4 px-2 py-3 rounded hover:bg-gray-900 transition ${active ? 'text-[#FBDF85] font-bold' : ''
                                    }`}
                            >
                                <Icon className="w-8 h-8" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                    <Link
                        href="/upload"
                        onClick={closeSidebar}
                        className={`flex items-center space-x-4 px-2 py-3 rounded hover:bg-gray-900 transition ${isActive('/upload') ? 'text-[#FBDF85] font-bold' : ''
                            }`}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Yükle</span>
                    </Link>

                    <Link
                        href="/profile"
                        onClick={closeSidebar}
                        className={`flex items-center space-x-4 px-2 py-3 rounded hover:bg-gray-900 transition ${isActive('/profile') ? 'text-[#FBDF85] font-bold' : ''
                            }`}
                    >
                        <User className="w-8 h-8" />
                        <span>Profil</span>
                    </Link>


                    {uid ? <button
                        onClick={logout}
                        className="cursor-pointer hover:cursor-pointer w-full flex items-center space-x-4 px-2 py-3 rounded hover:bg-gray-900 transition"
                    >
                        <LogOut className="w-8 h-8" />
                        <span>Log Out</span>
                    </button> : <FilledButton href='/login' className='mt-2 w-full'>Log In</FilledButton>}
                </nav>

                {/* Footer */}
                <div className="text-xs text-gray-500 space-y-2 mt-4">
                    <div>
                        <p className="font-bold mb-1">Takip edilen hesaplar</p>
                        <p>Takip ettiğiniz hesaplar burada görünecek</p>
                    </div>
                    <div className="space-y-1">
                        <a href="#" className="block hover:underline">Şirket</a>
                        <a href="#" className="block hover:underline">Program</a>
                        <a href="#" className="block hover:underline">Koşul ve Politikalar</a>
                    </div>
                    <p>© 2025 TikTok</p>
                </div>
            </div>
        </>
    );
}