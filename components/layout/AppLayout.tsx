"use client"

import { ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Nav } from './nav';
import { Sidebar } from './Sidebar';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const { data: session } = useSession();
    const isAuthenticated = !!session;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Default to collapsed
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    // Initialize state from localStorage and listen for changes
    useEffect(() => {
        const checkStates = () => {
            // Get states from localStorage
            const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            setSidebarCollapsed(collapsed);

            const expanded = localStorage.getItem('sidebarExpanded') === 'true';
            setSidebarExpanded(expanded);
        };

        // Check on mount
        checkStates();

        // Listen for sidebar state changes
        const handleStateChange = (e: CustomEvent) => {
            if (e.detail) {
                setSidebarExpanded(e.detail.isExpanded);
                setSidebarCollapsed(e.detail.isCollapsed);
            } else {
                checkStates();
            }
        };

        window.addEventListener('sidebarStateChange', handleStateChange as EventListener);

        return () => {
            window.removeEventListener('sidebarStateChange', handleStateChange as EventListener);
        };
    }, []);

    // Calculate content margin - always give space for at least the collapsed sidebar
    const contentMargin = () => {
        if (!isAuthenticated) return '';

        // Default to collapsed sidebar width
        let margin = 'ml-16';

        // If sidebar is expanded and not collapsed, use the wider margin
        if (sidebarExpanded && !sidebarCollapsed) {
            margin = 'ml-64';
        }

        return margin;
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Nav />
            <div className="flex flex-1">
                {isAuthenticated && <Sidebar />}
                <main className={`flex-1 transition-all duration-300 ease-in-out ${contentMargin()}`}>
                    <div className="w-full h-full py-6 px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}