import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ShinyButton = ({ text, className, onClick, icon: Icon }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "group relative px-8 py-4 rounded-full bg-primary text-primary-foreground font-heading font-semibold tracking-wide overflow-hidden shadow-[0_0_20px_-5px_var(--color-primary)] hover:shadow-[0_0_30px_-5px_var(--color-primary)] transition-all",
                className
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
            <span className="relative flex items-center gap-2 z-10">
                {text}
                {Icon && <Icon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </span>
        </motion.button>
    );
};

export default ShinyButton;
