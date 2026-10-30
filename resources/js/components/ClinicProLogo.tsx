import React from 'react';
import { cn } from '@/lib/utils';

interface ClinicProLogoProps {
    className?: string;
    iconOnly?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'default' | 'light' | 'dark';
}

export function ClinicProLogo({
    className,
    iconOnly = false,
    size = 'md',
    variant = 'default',
}: ClinicProLogoProps) {
    const sizeConfig = {
        sm: {
            img: 'h-7 w-7',
            text: 'text-lg',
            badge: 'text-[9px] px-1 py-0.2',
        },
        md: {
            img: 'h-9 w-9',
            text: 'text-xl',
            badge: 'text-[10px] px-1.5 py-0.5',
        },
        lg: {
            img: 'h-12 w-12',
            text: 'text-2xl',
            badge: 'text-xs px-2 py-0.5',
        },
        xl: {
            img: 'h-16 w-16',
            text: 'text-3xl',
            badge: 'text-xs px-2.5 py-1',
        },
    };

    const currentSize = sizeConfig[size];

    return (
        <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
            <div className={cn('relative flex-shrink-0 rounded-xl overflow-hidden', currentSize.img)}>
                <img
                    src="/images/clinicpro-logo.png"
                    alt="ClinicPro"
                    className="w-full h-full object-contain"
                />
            </div>

            {!iconOnly && (
                <div className="flex items-center">
                    <span
                        className={cn(
                            'font-black tracking-tight font-sans transition-colors',
                            currentSize.text,
                            variant === 'light'
                                ? 'text-white'
                                : 'text-[#16134D] dark:text-white'
                        )}
                    >
                        Clinic
                        <span className="text-[#0080FF] dark:text-[#38BDF8]">Pro</span>
                    </span>
                </div>
            )}
        </div>
    );
}

export default ClinicProLogo;

