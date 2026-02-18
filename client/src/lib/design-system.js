// HireMind "Cinematic Hero" Design System - Animation & Layout Utilities

// 1. Motion Variants (Framer Motion)
export const MOTION = {
    // Container: Staggers children
    container: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        }
    },

    // Drift: Elements float up gently with Mass
    drift: {
        hidden: { opacity: 0, y: 40, rotate: 1 },
        visible: {
            opacity: 1,
            y: 0,
            rotate: 0,
            transition: { type: "spring", stiffness: 25, damping: 25, mass: 1.2 }
        }
    },

    // Fade: Simple reveal
    fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
    },

    // Scale: Soft pop-in
    scale: {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 50, damping: 20 }
        }
    }
};

// 2. Common Tailwind Styling Classes
export const STYLES = {
    // Typography
    h1_hero: "text-7xl md:text-8xl font-heading font-bold tracking-tighter text-white",
    h1_hero_gradient: "text-transparent bg-clip-text bg-gradient-to-r from-white/80 to-transparent",
    h2: "text-4xl md:text-5xl font-heading font-bold text-white tracking-tight",
    p_body: "text-lg text-white/60 font-light leading-relaxed",

    // Components
    glass_card: "border border-white/10 bg-black/20 backdrop-blur-md rounded-3xl",
    glass_button: "px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-heading font-bold tracking-wide transition-all hover:bg-white hover:text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]",

    // Utilities
    text_muted: "text-white/40",
    border_subtle: "border-white/10"
};
