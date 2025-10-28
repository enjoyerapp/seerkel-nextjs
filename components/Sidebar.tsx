'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Search,
    User
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

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

    return (
        <div className="w-60 bg-black border-r border-gray-800 flex flex-col p-4">
            {/* Logo */}
            <Link href="/" className="flex items-center mb-8 px-2">
                <img className="w-40 h-auto" src={"/logo_seerkel.webp"}>
                </img>
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
                    className={`flex items-center space-x-4 px-2 py-3 rounded hover:bg-gray-900 transition ${isActive('/profile') ? 'text-[#FBDF85] font-bold' : ''
                        }`}
                >
                    <User className="w-8 h-8" />
                    <span>Profil</span>
                </Link>
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
    );
}