import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, useUser, SignInButton } from '@clerk/clerk-react';
import { LayoutDashboard, FileText, History, Trophy, Menu, X, Brain, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './ui/logo';
import { Button } from './ui/button';

const Navbar = () => {
    const { isSignedIn } = useUser();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Scroll effect for glassmorphism
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'New Interview', path: '/role-selection', icon: Brain },
        { name: 'My History', path: '/history', icon: History },
        { name: 'Goals', path: '/goals', icon: Trophy },
        { name: 'Resume AI', path: '/resume-scan', icon: FileText },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out border-b ${scrolled
                        ? 'bg-[#050505]/80 backdrop-blur-xl border-white/5 h-16 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                        : 'bg-transparent border-transparent h-20'
                    }`}
            >
                <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">

                    {/* LEFT: LOGO */}
                    <Link to="/" className="relative z-10">
                        <Logo className="scale-90" />
                    </Link>

                    {/* CENTER: FLOATING NAVIGATION (Desktop) */}
                    <nav className="hidden md:flex items-center p-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md absolute left-1/2 -translate-x-1/2 shadow-inner">
                        {isSignedIn && navLinks.map((link) => {
                            const active = isActive(link.path);
                            return (
                                <Link key={link.name} to={link.path} className="relative">
                                    <div className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 ${active ? 'text-white' : 'text-white/40 hover:text-white/80'
                                        }`}>
                                        {active && (
                                            <motion.div
                                                layoutId="nav-pill"
                                                className="absolute inset-0 bg-primary/20 border border-primary/20 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            <link.icon className={`w-3.5 h-3.5 ${active ? 'text-primary' : ''}`} />
                                            {link.name}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* RIGHT: USER ACTIONS */}
                    <div className="flex items-center gap-4 relative z-10">
                        {isSignedIn ? (
                            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                                <UserButton
                                    afterSignOutUrl="/"
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-9 h-9 ring-2 ring-white/10 hover:ring-primary/50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]",
                                            userButtonPopoverCard: "bg-black border border-white/10 shadow-2xl"
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login">
                                    <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 font-mono text-xs tracking-wider">
                                        LOGIN
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6 font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all">
                                        GET ACCESS
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden p-2 text-white/60 hover:text-white bg-white/5 rounded-lg border border-white/5"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* MOBILE MENU OVERLAY */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-[#050505]/95 backdrop-blur-3xl pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-2">
                            {isSignedIn && navLinks.map((link, idx) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Link
                                        to={link.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-4 p-4 rounded-xl border border-white/5 transition-all ${isActive(link.path)
                                                ? 'bg-primary/20 border-primary/30 text-white'
                                                : 'bg-white/5 text-white/50'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${isActive(link.path) ? 'bg-primary text-white' : 'bg-black text-white/40'}`}>
                                            <link.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-lg font-medium tracking-wide">{link.name}</span>
                                        <ChevronRight className="ml-auto w-4 h-4 opacity-50" />
                                    </Link>
                                </motion.div>
                            ))}

                            {!isSignedIn && (
                                <div className="mt-8 flex flex-col gap-4">
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full h-12 border-white/10 bg-white/5 text-white">Log In</Button>
                                    </Link>
                                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full h-12 bg-white text-black font-bold">Get Started</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
