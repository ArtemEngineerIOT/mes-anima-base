import * as React from "react";

import { cn } from "@/shared/lib/css";

function Table({ className, ...props }: React.ComponentProps<"table">) {
    return <table className={cn("w-full caption-bottom text-sm", className)} {...props} />;
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
    return (
        <thead
            className={cn(
                "[&_tr]:border-b [&_tr:hover]:!bg-transparent",
                className,
            )}
            {...props}
        />
    );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
    return (
        <tbody
            className={cn(
                "[&_tr:last-child]:border-0 [&>tr:nth-child(even):not(:hover)]:bg-muted/60",
                className,
            )}
            {...props}
        />
    );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
    return (
        <tfoot
            className={cn("bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
            {...props}
        />
    );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
    return (
        <tr
            className={cn(
                "border-b transition-colors hover:!bg-primary/20 data-[state=selected]:bg-muted",
                className,
            )}
            {...props}
        />
    );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
    return (
        <th
            className={cn(
                "text-muted-foreground h-10 px-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0",
                className,
            )}
            {...props}
        />
    );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
    return (
        <td className={cn("p-2 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
    );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
    return <caption className={cn("text-muted-foreground mt-4 text-sm", className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };

