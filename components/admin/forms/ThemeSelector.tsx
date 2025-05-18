import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Palette } from 'lucide-react';

// Predefined color themes
export const COLOR_THEMES = {
    default: {
        primaryColor: '#007bff',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        name: 'Default Blue'
    },
    dark: {
        primaryColor: '#6366f1',
        backgroundColor: '#1f2937',
        textColor: '#f3f4f6',
        name: 'Dark Mode'
    },
    professional: {
        primaryColor: '#0f766e',
        backgroundColor: '#f8fafc',
        textColor: '#334155',
        name: 'Professional Teal'
    },
    vibrant: {
        primaryColor: '#ec4899',
        backgroundColor: '#ffffff',
        textColor: '#111827',
        name: 'Vibrant Pink'
    },
    warm: {
        primaryColor: '#f97316',
        backgroundColor: '#fffbeb',
        textColor: '#422006',
        name: 'Warm Orange'
    },
    neutral: {
        primaryColor: '#64748b',
        backgroundColor: '#f8fafc',
        textColor: '#334155',
        name: 'Neutral Gray'
    }
};

interface ThemeSelectorProps {
    currentTheme: string;
    onThemeChange: (theme: string) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
    return (
        <div className="flex items-center gap-2">
            <Palette size={18} className="text-muted-foreground" />
            <Select value={currentTheme} onValueChange={onThemeChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                        <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: theme.primaryColor }}
                                />
                                {theme.name}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}