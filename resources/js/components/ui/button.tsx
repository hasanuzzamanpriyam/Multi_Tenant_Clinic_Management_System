'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
    {
        variants: {
            variant: {
                default: 'bg-[#0080FF] text-white shadow-sm hover:bg-[#0070E0] hover:shadow-md dark:bg-[#0080FF] dark:hover:bg-[#0070E0]',
                navy: 'bg-[#16134D] text-white shadow-sm hover:bg-[#201C66] dark:bg-[#201C66] dark:hover:bg-[#2C2785]',
                destructive: 'bg-rose-600 text-white shadow-xs hover:bg-rose-700 focus-visible:ring-rose-500',
                outline: 'border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
                secondary: 'bg-[#EAF4FF] text-[#0066CC] hover:bg-[#D6EAFF] dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60',
                ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                link: 'text-[#0080FF] underline-offset-4 hover:underline dark:text-[#38BDF8]',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-8.5 rounded-md px-3 text-xs',
                lg: 'h-11.5 rounded-xl px-6 text-base',
                icon: 'h-9 w-9 rounded-lg',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
