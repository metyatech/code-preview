import type { ReactNode } from 'react';
interface ToolbarButtonProps {
    onClick: () => void;
    pressed: boolean;
    label: string;
    icon: ReactNode;
}
export declare const ToolbarButton: ({ onClick, pressed, label, icon }: ToolbarButtonProps) => import("react/jsx-runtime").JSX.Element;
export {};
