import { cn } from "@/lib/utils";

type HomeBackgroundProps = {
    className?: string;
};

export function HomeBackground({ className }: HomeBackgroundProps) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
                className
            )}
        >
            {/* Base */}
            <div className="absolute inset-0 bg-background" />

            {/* Grid */}
            <div
                className="absolute inset-0 opacity-50 dark:opacity-70"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, color-mix(in oklch, var(--border) 70%, transparent) 1px, transparent 1px),
                        linear-gradient(to bottom, color-mix(in oklch, var(--border) 70%, transparent) 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Top Spotlight */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.18), transparent 60%)",
                }}
            />

            {/* Left Glow */}
            <div className="absolute left-40 top-32 h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />

            {/* Center Glow */}
            <div className="absolute left-1/2 top-48 h-120 w-120 -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />

            {/* Bottom Right Glow */}
            <div className="absolute bottom-40 right-40 h-112 w-md rounded-full bg-primary/10 blur-[120px]" />

            {/* Noise Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, currentColor 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                }}
            />

            {/* Fade Top */}
            <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-background to-transparent" />

            {/* Fade Bottom */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background to-transparent" />
        </div>
    );
}