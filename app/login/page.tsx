'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    X
} from 'lucide-react';
import { useSearchParams, redirect } from 'next/navigation'
import { useUid } from "@/context/UserContext"

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showEmailForm, setShowEmailForm] = useState(false);
    const { setUid } = useUid()
    const [hasCode, setHasCode] = useState<boolean | null>(null);

    useEffect(() => {
        async function login() {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");
            if (!code) {
                setHasCode(false)
                return
            }
            setHasCode(true)
            const res = await fetch("/api/login", {
                method: "POST",
                body: JSON.stringify({ googleCode: code })
            })
            const { uid } = await res.json()
            setUid(uid)
            if (res.ok) {
                redirect("/")
            }
        }

        login()
    }, [])

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login:', { email, password });
    };

    const handleGoogleLogin = () => {
        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            redirect_uri: `http://localhost:3000/login`,
            response_type: "code",
            scope: "openid email profile",
            access_type: "offline",
            prompt: "consent",
        });

        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Login Container */}
            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <img className="w-40 h-auto" src="/logo_seerkel.webp" alt="Logo" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome to Seerkel</h1>
                        <p className="text-white/90 text-sm">New generation social media</p>
                    </div>

                    {(hasCode == null || hasCode) ? <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4 mt-4"></div> : !showEmailForm ? (
                        <div className="p-8 space-y-4">
                            <h2 className="text-xl font-semibold text-white text-center mb-6">
                                Login or Signup
                            </h2>

                            {/* <button
                                onClick={() => setShowEmailForm(true)}
                                className="w-full flex items-center justify-center space-x-3 px-4 py-4 bg-gray-800 border-2 border-gray-700 rounded-lg hover:bg-gray-750 hover:border-red-500 transition-all duration-200 group"
                            >
                                <Mail className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition" />
                                <span className="font-medium text-white group-hover:text-red-500 transition">
                                    Continue with E-mail
                                </span>
                            </button> */}

                            {/* Google Login */}
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center space-x-3 px-4 py-4 bg-white hover:bg-gray-100 rounded-lg transition-all duration-200 group shadow-lg"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="font-medium text-gray-700">
                                    Continue with Google
                                </span>
                            </button>

                            {/* Terms */}
                            <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
                                Devam ederek, TikTok'un{' '}
                                <a href="#" className="text-red-500 hover:underline">Hizmet Şartları</a>'nı kabul etmiş ve{' '}
                                <a href="#" className="text-red-500 hover:underline">Gizlilik Politikası</a>'nı okumuş olursunuz.
                            </p>
                        </div>
                    ) : (
                        /* Email Login Form */
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white">
                                    Login with E-mail
                                </h2>
                                <button
                                    onClick={() => setShowEmailForm(false)}
                                    className="p-1 hover:bg-gray-800 rounded-full transition"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                {/* Email Input */}
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <Mail className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="E-posta adresi"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-red-500 transition text-white placeholder-gray-500"
                                        required
                                    />
                                </div>

                                {/* Password Input */}
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <Lock className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Şifre"
                                        className="w-full pl-12 pr-12 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-red-500 transition text-white placeholder-gray-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                {/* Forgot Password */}
                                <div className="text-right">
                                    <a href="#" className="text-sm text-red-500 hover:text-red-400 hover:underline">
                                        Şifremi unuttum?
                                    </a>
                                </div>

                                {/* Login Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                                >
                                    Login
                                </button>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-700"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-gray-900 text-gray-500">veya</span>
                                    </div>
                                </div>

                                {/* Google Login in Form */}
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white hover:bg-gray-100 rounded-lg transition-all duration-200 group shadow-lg"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="font-medium text-gray-700">
                                        Google ile devam et
                                    </span>
                                </button>

                                {/* Sign Up Link */}
                                <p className="text-center text-sm text-gray-400 mt-4">
                                    Hesabın yok mu?{' '}
                                    <a href="#" className="text-red-500 hover:text-red-400 font-semibold hover:underline">
                                        Kaydol
                                    </a>
                                </p>
                            </form>
                        </div>
                    )}
                </div>

                {/* Skip Login - Go to Homepage */}
                {!hasCode && <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 text-gray-400 hover:text-white font-medium transition group"
                    >
                        <span className="group-hover:underline">Continue without login</span>
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>}
            </div>

            {/* CSS for animations */}
            <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </div>
    );
}