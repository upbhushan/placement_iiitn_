import React, { useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Palette, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

// Enhanced color themes with better dark mode options
export const COLOR_THEMES = {
    default: {
        primaryColor: '#007bff',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        name: 'Default Light',
        darkMode: false
    },
    dark: {
        primaryColor: '#6366f1',
        backgroundColor: '#121212', // Deeper dark for better contrast
        textColor: '#e2e8f0',
        name: 'Dark Mode',
        darkMode: true
    },
    midnight: {
        primaryColor: '#10b981',
        backgroundColor: '#0f172a', // Deep blue-black
        textColor: '#e2e8f0',
        name: 'Midnight Green',
        darkMode: true
    },
    professional: {
        primaryColor: '#0f766e',
        backgroundColor: '#f8fafc',
        textColor: '#334155',
        name: 'Professional Teal',
        darkMode: false
    },
    vibrant: {
        primaryColor: '#ec4899',
        backgroundColor: '#ffffff',
        textColor: '#111827',
        name: 'Vibrant Pink',
        darkMode: false
    },
    warm: {
        primaryColor: '#f97316',
        backgroundColor: '#fffbeb',
        textColor: '#422006',
        name: 'Warm Orange',
        darkMode: false
    },
    neutral: {
        primaryColor: '#64748b',
        backgroundColor: '#f8fafc',
        textColor: '#334155',
        name: 'Neutral Gray',
        darkMode: false
    },
    darkContrast: {
        primaryColor: '#f43f5e', // Bright pink for better visibility in dark mode
        backgroundColor: '#18181b', // Dark background
        textColor: '#f8fafc',
        name: 'High Contrast Dark',
        darkMode: true
    }
};

interface ThemeSelectorProps {
    currentTheme: string;
    onThemeChange: (theme: string) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
    const { setTheme, resolvedTheme, systemTheme } = useTheme();

    // Synchronize form theme with system theme if possible
    useEffect(() => {
        // When component mounts, check if system is in dark mode
        if (resolvedTheme === 'dark' && !COLOR_THEMES[currentTheme as keyof typeof COLOR_THEMES]?.darkMode) {
            // If current theme is not a dark mode theme, suggest switching
            const preferredDarkTheme = 'dark';
            onThemeChange(preferredDarkTheme);
        }
    }, [resolvedTheme]);

    // Get current theme data
    const currentThemeData = COLOR_THEMES[currentTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.default;

    return (
        <div className="flex items-center gap-2">
            {currentThemeData.darkMode ? (
                <Moon size={18} className="text-muted-foreground" />
            ) : (
                <Sun size={18} className="text-muted-foreground" />
            )}

            <Select value={currentTheme} onValueChange={onThemeChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                    <div className="pb-1 mb-2 border-b">
                        <span className="text-sm text-muted-foreground px-2 py-1">Light Themes</span>
                    </div>
                    {Object.entries(COLOR_THEMES)
                        .filter(([_, theme]) => !theme.darkMode)
                        .map(([key, theme]) => (
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

                    <div className="pt-2 pb-1 mb-2 border-b border-t mt-2">
                        <span className="text-sm text-muted-foreground px-2 py-1">Dark Themes</span>
                    </div>
                    {Object.entries(COLOR_THEMES)
                        .filter(([_, theme]) => theme.darkMode)
                        .map(([key, theme]) => (
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