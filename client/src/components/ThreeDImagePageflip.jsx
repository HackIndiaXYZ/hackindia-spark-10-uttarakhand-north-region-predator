import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const DEFAULT_PAGES = [
    {
        id: 1,
        frontImage: "/1.jpg",
        backImage: "/2.jpg",
        frontTitle: "Himalayan Ridge",
        frontSubtitle: "Majestic Peaks",
        frontBadge: "Cover",
        backTitle: "Alpine Valley",
        backSubtitle: "Lush Greenery",
        backBadge: "Plate 01",
    },
    {
        id: 2,
        frontImage: "/3.jpg",
        backImage: "/4.jpg",
        frontTitle: "Snow Caps",
        frontSubtitle: "Winter Wonderland",
        frontBadge: "Plate 02",
        backTitle: "Starry Night",
        backSubtitle: "Milky Way Over Mountains",
        backBadge: "Plate 03",
    },
    {
        id: 3,
        frontImage: "/5.jpg",
        backImage: "/6.jpg",
        frontTitle: "Glacier Lake",
        frontSubtitle: "Crystal Clear Waters",
        frontBadge: "Plate 04",
        backTitle: "Autumn Trek",
        backSubtitle: "Golden Leaves",
        backBadge: "Plate 05",
    },
    {
        id: 4,
        frontImage: "/7.jpg",
        backImage: "/8.jpg",
        frontTitle: "Misty Morning",
        frontSubtitle: "Clouds Rolling In",
        frontBadge: "Plate 06",
        backTitle: "Sunset Peak",
        backSubtitle: "Golden Hour Glow",
        backBadge: "Endplate",
    },
];

export const ThreeDImagePageflip = forwardRef(({
    pages = DEFAULT_PAGES,
    defaultTurnedIndex = 0,
    turnedIndex: controlledTurnedIndex,
    onPageChange,
    pageWidth = 350,  // Made bigger as requested (default was 230)
    pageHeight = 500, // Made bigger as requested (default was 330)
    perspective = 1300,
    peekAngle = 14,
    turnAngle = 180,
    duration = 0.65,
    easing = "cubic-bezier(0.4, 0, 0.2, 1)",
    shadowIntensity = 0.45,
    spineShift = true,
    radius = "10px",
    showPageNumbers = true,
    showSpineBinding = true,
    accentColor = "#f97316", // Tailwind orange-500 to match theme
    autoplay = false,
    autoplayInterval = 3500,
    pauseOnHover = true,
    interactive = true,
    showControls = true,
    className,
    style,
}, ref) => {
    const [internalTurned, setInternalTurned] = useState(defaultTurnedIndex);
    const [isHovered, setIsHovered] = useState(false);
    const [peekingIndex, setPeekingIndex] = useState(null);

    const totalLeaves = pages.length;
    const currentTurned = controlledTurnedIndex !== undefined ? controlledTurnedIndex : internalTurned;
    const isOpen = currentTurned > 0 && currentTurned < totalLeaves;

    const parsedRadius = typeof radius === "number" ? `${radius}px` : radius;

    const setTurned = useCallback((newCount) => {
        const clamped = Math.max(0, Math.min(newCount, totalLeaves));
        if (controlledTurnedIndex === undefined) {
            setInternalTurned(clamped);
        }
        if (onPageChange) {
            onPageChange(clamped, totalLeaves);
        }
    }, [controlledTurnedIndex, totalLeaves, onPageChange]);

    const flipNext = useCallback(() => {
        if (currentTurned < totalLeaves) {
            setTurned(currentTurned + 1);
        }
    }, [currentTurned, totalLeaves, setTurned]);

    const flipPrev = useCallback(() => {
        if (currentTurned > 0) {
            setTurned(currentTurned - 1);
        }
    }, [currentTurned, setTurned]);

    const resetBook = useCallback(() => {
        setTurned(0);
    }, [setTurned]);

    useImperativeHandle(ref, () => ({
        next: flipNext,
        prev: flipPrev,
        reset: resetBook,
        goTo: (idx) => setTurned(idx),
        getTurnedCount: () => currentTurned,
        getTotalLeaves: () => totalLeaves,
    }));

    // Autoplay Timer
    useEffect(() => {
        if (!autoplay || (pauseOnHover && isHovered) || totalLeaves <= 1) return;
        const timer = setInterval(() => {
            setInternalTurned((prev) => (prev >= totalLeaves ? 0 : prev + 1));
        }, autoplayInterval);
        return () => clearInterval(timer);
    }, [autoplay, autoplayInterval, pauseOnHover, isHovered, totalLeaves]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight") flipNext();
            if (e.key === "ArrowLeft") flipPrev();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [flipNext, flipPrev]);

    const handleLeafClick = (index) => {
        if (!interactive) return;
        if (index === currentTurned) {
            // Click unturned top page -> flip forward
            flipNext();
        } else if (index === currentTurned - 1) {
            // Click turned top left page -> flip backward
            flipPrev();
        }
    };

    return (
        <div
            className={cn("w-full flex flex-col items-center justify-center select-none py-6", className)}
            style={style}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setPeekingIndex(null);
            }}
        >
            {/* 3D Book Viewport Stage */}
            <div
                className="relative flex items-center justify-center transition-all duration-500 max-w-full overflow-hidden sm:overflow-visible"
                style={{
                    perspective: `${perspective}px`,
                    width: `${pageWidth * 2 + 40}px`,
                    height: `${pageHeight + 40}px`,
                }}
            >
                {/* 3D Book Container */}
                <div
                    className="relative transition-transform"
                    style={{
                        width: `${pageWidth}px`,
                        height: `${pageHeight}px`,
                        transformStyle: "preserve-3d",
                        transition: `transform ${duration}s ${easing}`,
                        transform: spineShift && isOpen ? `translateX(${pageWidth / 2}px)` : "translateX(0)",
                    }}
                >
                    {/* Spine Shadow & Binding Crease */}
                    {showSpineBinding && (
                        <div
                            className="absolute top-0 bottom-0 left-[-4px] w-[8px] rounded-l-sm bg-gradient-to-r from-black/80 via-zinc-800 to-black/40 shadow-2xl z-30 pointer-events-none"
                            style={{
                                opacity: isOpen ? 0.95 : 0.6,
                                transition: `opacity ${duration}s ease`,
                            }}
                        />
                    )}

                    {/* Ground Ambience Drop Shadow underneath the book */}
                    <div
                        className="absolute -bottom-6 left-[-15%] w-[130%] h-8 bg-black/40 rounded-full blur-xl pointer-events-none transition-all duration-500"
                        style={{
                            opacity: isOpen ? 0.7 : 0.4,
                            transform: isOpen ? "scale(1.15)" : "scale(0.85)",
                        }}
                    />

                    {/* Book Leaves Stacking Loop */}
                    {pages.map((leaf, index) => {
                        const isTurned = index < currentTurned;
                        const isCanPeek = index === currentTurned;
                        const isPeeking = peekingIndex === index;

                        // Calculate Z-Index: turned leaves stack forward on left, unturned leaves stack backward on right
                        const zIndex = isTurned ? index + 1 : totalLeaves - index;

                        // Rotation Angle
                        let leafRotation = isTurned ? -turnAngle : 0;
                        if (!isTurned && isPeeking) {
                            leafRotation = -peekAngle;
                        }

                        return (
                            <div
                                key={leaf.id ?? index}
                                onClick={() => handleLeafClick(index)}
                                onMouseEnter={() => {
                                    if (isCanPeek) setPeekingIndex(index);
                                }}
                                onMouseLeave={() => {
                                    if (peekingIndex === index) setPeekingIndex(null);
                                }}
                                className={cn(
                                    "absolute inset-0 origin-left cursor-pointer",
                                    interactive ? "cursor-pointer" : "pointer-events-none"
                                )}
                                style={{
                                    transformStyle: "preserve-3d",
                                    transition: `transform ${duration}s ${easing}`,
                                    transform: `rotateY(${leafRotation}deg)`,
                                    zIndex,
                                    borderRadius: parsedRadius,
                                }}
                            >
                                {/* FRONT FACE (Visible when page is on the right) */}
                                <div
                                    className="absolute inset-0 w-full h-full bg-zinc-950 overflow-hidden"
                                    style={{
                                        backfaceVisibility: "hidden",
                                        WebkitBackfaceVisibility: "hidden",
                                        borderRadius: parsedRadius,
                                        boxShadow: `0 12px 28px rgba(0, 0, 0, ${shadowIntensity})`,
                                    }}
                                >
                                    <img
                                        src={leaf.frontImage}
                                        alt={leaf.frontTitle ?? `Page ${index * 2 + 1}`}
                                        className="w-full h-full object-cover pointer-events-none select-none"
                                        loading="lazy"
                                    />

                                    {/* Spine crease shadow overlay for 3D depth */}
                                    <div
                                        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                                        style={{
                                            background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.12) 14%, transparent 35%)",
                                            opacity: isTurned ? 0 : 1,
                                        }}
                                    />

                                    {/* Bottom Vignette & Metadata */}
                                    <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/85 via-black/35 to-transparent text-white pointer-events-none">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            {leaf.frontBadge && (
                                                <span
                                                    className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20"
                                                    style={{
                                                        color: accentColor,
                                                        backgroundColor: `${accentColor}20`,
                                                    }}
                                                >
                                                    {leaf.frontBadge}
                                                </span>
                                            )}
                                            {showPageNumbers && (
                                                <span className="text-[10px] font-mono text-zinc-300/80">
                                                    {index * 2 + 1}
                                                </span>
                                            )}
                                        </div>
                                        {leaf.frontTitle && (
                                            <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white drop-shadow-sm line-clamp-1">
                                                {leaf.frontTitle}
                                            </h4>
                                        )}
                                        {leaf.frontSubtitle && (
                                            <p className="text-[10px] text-zinc-300/70 font-medium line-clamp-1">
                                                {leaf.frontSubtitle}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* BACK FACE (Visible when page is turned to the left) */}
                                <div
                                    className="absolute inset-0 w-full h-full bg-zinc-950 overflow-hidden"
                                    style={{
                                        backfaceVisibility: "hidden",
                                        WebkitBackfaceVisibility: "hidden",
                                        transform: "rotateY(180deg)",
                                        borderRadius: parsedRadius,
                                        boxShadow: `0 12px 28px rgba(0, 0, 0, ${shadowIntensity})`,
                                    }}
                                >
                                    <img
                                        src={leaf.backImage}
                                        alt={leaf.backTitle ?? `Page ${index * 2 + 2}`}
                                        className="w-full h-full object-cover pointer-events-none select-none"
                                        loading="lazy"
                                    />

                                    {/* Spine crease shadow overlay for turned back-face */}
                                    <div
                                        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                                        style={{
                                            background: "linear-gradient(to left, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.12) 14%, transparent 35%)",
                                            opacity: isTurned ? 1 : 0,
                                        }}
                                    />

                                    {/* Bottom Vignette & Metadata */}
                                    <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/85 via-black/35 to-transparent text-white pointer-events-none">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            {leaf.backBadge && (
                                                <span
                                                    className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20"
                                                    style={{
                                                        color: accentColor,
                                                        backgroundColor: `${accentColor}20`,
                                                    }}
                                                >
                                                    {leaf.backBadge}
                                                </span>
                                            )}
                                            {showPageNumbers && (
                                                <span className="text-[10px] font-mono text-zinc-300/80">
                                                    {index * 2 + 2}
                                                </span>
                                            )}
                                        </div>
                                        {leaf.backTitle && (
                                            <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white drop-shadow-sm line-clamp-1">
                                                {leaf.backTitle}
                                            </h4>
                                        )}
                                        {leaf.backSubtitle && (
                                            <p className="text-[10px] text-zinc-300/70 font-medium line-clamp-1">
                                                {leaf.backSubtitle}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Book Controls & Page Progress Toolbar */}
            {showControls && (
                <div className="flex items-center justify-center gap-3 mt-8 select-none">
                    <button
                        onClick={flipPrev}
                        disabled={currentTurned === 0}
                        aria-label="Previous Page"
                        className="px-4 py-2 rounded-xl flex items-center gap-1 text-sm font-bold bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Prev</span>
                    </button>

                    <button
                        onClick={resetBook}
                        disabled={currentTurned === 0}
                        aria-label="Reset Book"
                        className="px-4 py-2 rounded-xl flex items-center gap-1 text-sm font-bold bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset</span>
                    </button>

                    <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-mono text-slate-500 shadow-sm">
                        <span className="font-bold text-slate-800">{currentTurned}</span>
                        <span className="opacity-50"> / </span>
                        <span>{totalLeaves} leaves</span>
                    </div>

                    <button
                        onClick={flipNext}
                        disabled={currentTurned === totalLeaves}
                        aria-label="Next Page"
                        className="px-4 py-2 rounded-xl flex items-center gap-1 text-sm font-bold bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
                    >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
});

ThreeDImagePageflip.displayName = "ThreeDImagePageflip";

export default ThreeDImagePageflip;
