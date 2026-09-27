import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const LiquidGlassButton = React.forwardRef(
  (
    {
      variant = "glass",
      size = "md",
      glow = true,
      fullWidth = false,
      children,
      icon,
      className,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-8 px-4 text-xs rounded-full gap-1.5",
      md: "h-10 px-5 text-sm rounded-full gap-2",
      lg: "h-12 px-7 text-base rounded-full gap-2.5",
      xl: "h-14 px-9 text-lg rounded-[2rem] gap-3",
      icon: "w-10 h-10 p-0 rounded-full flex items-center justify-center shrink-0",
    };

    const variantStyles = {
      glass: cn(
        "text-slate-900 dark:text-white font-semibold tracking-wide drop-shadow-sm",
        "bg-gradient-to-b from-white/50 via-white/20 to-white/10 dark:from-white/25 dark:via-white/10 dark:to-white/5",
        "backdrop-blur-md saturate-[220%]",
        "border border-white/85 dark:border-white/25",
        "shadow-[0_16px_35px_-6px_rgba(15,23,42,0.25),0_6px_15px_-4px_rgba(15,23,42,0.15),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.95),0_0_0_1px_rgba(255,255,255,0.85),inset_0_-4px_8px_0px_rgba(0,0,0,0.15),inset_3px_0_4px_0px_rgba(255,255,255,0.5),inset_-3px_0_4px_0px_rgba(255,255,255,0.5)]",
        "dark:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.7),0_8px_18px_-4px_rgba(0,0,0,0.5),inset_0_2px_1.5px_0px_rgba(255,255,255,0.4),0_0_0_1px_rgba(255,255,255,0.2),inset_0_-4px_8px_0px_rgba(0,0,0,0.5)]",
        "hover:bg-gradient-to-b hover:from-white/65 hover:via-white/35 hover:to-white/15 hover:shadow-[0_22px_45px_-6px_rgba(15,23,42,0.3)]"
      ),
      primary: cn(
        "text-white font-semibold tracking-wide drop-shadow-sm",
        "bg-gradient-to-b from-[#ff6a3d]/90 via-[#ee3e26]/85 to-[#c31e14]/90",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/60 dark:border-white/30",
        "shadow-[0_16px_35px_-4px_rgba(238,62,38,0.65),0_6px_12px_-2px_rgba(0,0,0,0.2),inset_0_2.5px_2px_0px_rgba(255,230,220,0.95),0_0_0_1px_rgba(255,180,160,0.9),inset_0_-4px_8px_0px_rgba(130,15,0,0.5)]",
        "hover:shadow-[0_20px_40px_-4px_rgba(238,62,38,0.8),inset_0_2.5px_2px_0px_rgba(255,240,235,0.95)]"
      ),
      secondary: cn(
        "text-slate-800 dark:text-slate-100 font-semibold",
        "bg-gradient-to-b from-white/55 via-white/25 to-slate-200/20",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/75",
        "shadow-[0_16px_35px_-6px_rgba(15,23,42,0.2),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.95),inset_0_-4px_7px_0px_rgba(0,0,0,0.15)]"
      ),
      outline: cn(
        "text-slate-800 dark:text-slate-100 font-semibold border border-white/80 dark:border-white/25",
        "bg-white/25 dark:bg-white/10 backdrop-blur-md saturate-[200%]",
        "shadow-[0_12px_28px_-5px_rgba(0,0,0,0.15),inset_0_2px_1px_0px_rgba(255,255,255,0.9)]"
      ),
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.035, y: -2 }}
        whileTap={{ scale: 0.95, y: 3 }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "relative outline-none border-none cursor-pointer font-sans select-none overflow-hidden",
          "inline-flex items-center justify-center backdrop-blur-md saturate-[220%]",
          "transition-all duration-200 ease-out",
          sizeClasses[size === "icon" ? "icon" : size],
          variantStyles[variant] || variantStyles.glass,
          fullWidth && "w-full flex-1",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "absolute top-[1px] left-1 right-1 h-[48%] pointer-events-none transition-all duration-200",
            size === "icon" || variant === "icon"
              ? "rounded-t-full rounded-b-[50%]"
              : "rounded-[100px_100px_45%_45%]"
          )}
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 40%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        <span
          className={cn(
            "absolute bottom-[1.5px] left-1.5 right-1.5 h-[28%] pointer-events-none transition-all duration-200",
            size === "icon" || variant === "icon"
              ? "rounded-b-full rounded-t-[30%]"
              : "rounded-[0_0_100px_100px]"
          )}
          style={{
            background:
              "linear-gradient(0deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        <span className="relative z-10 flex items-center gap-2">
          {icon}
          {children}
        </span>
      </motion.button>
    );
  }
);
LiquidGlassButton.displayName = "LiquidGlassButton";
export default LiquidGlassButton;
