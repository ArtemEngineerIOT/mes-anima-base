import { cn } from "@/shared/lib/css";

interface IconProps {
    name: string;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl" | number;
}

export function Icon({ name, className, size = "md" }: IconProps) {
    const sizeClasses = {
        sm: "text-base",
        md: "text-xl",
        lg: "text-2xl",
        xl: "text-4xl",
    };

    const style = typeof size === "number" ? { fontSize: size } : undefined;
    const sizeClass = typeof size === "string" ? sizeClasses[size] : "";

    return (
        <span className={cn("material-symbols-outlined", sizeClass, className)} style={style}>
            {name}
        </span>
    );
}

