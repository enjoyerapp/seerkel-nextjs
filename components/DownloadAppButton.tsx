"use client";

import { Download } from "lucide-react";

export default function DownloadAppButton() {
    const handleDownload = () => {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

        const playStoreUrl = "https://play.google.com/store/apps/details?id=com.example.app";
        const appStoreUrl = "https://apps.apple.com/app/id1234567890";

        if (/android/i.test(userAgent)) {
            // Android device
            window.open(playStoreUrl, "_blank");
        } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
            // iOS device
            window.open(appStoreUrl, "_blank");
        } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
            // macOS device (desktop)
            window.open(appStoreUrl, "_blank");
        } else {
            // Other desktop (Windows/Linux)
            window.open(playStoreUrl, "_blank");
        }
    };

    return (
        <div className="fixed top-4.5 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 rounded-full px-4 py-2 z-30 md:top-4 md:right-4 md:left-auto md:transform-none">
            <button
                onClick={handleDownload}
                className="flex items-center space-x-2 hover:text-gray-300 transition"
            >
                <Download className="w-5 h-5" />
                <span className="text-sm">Download APP</span>
            </button>
        </div>
    );
}
