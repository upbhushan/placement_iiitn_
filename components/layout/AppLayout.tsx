"use client"

import { ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Nav } from './nav';
import { Sidebar } from './sidebar';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const { data: session, status } = useSession();
    const isAuthenticated = !!session;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Default to collapsed
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    // Initialize state from localStorage and listen for changes
    useEffect(() => {
        if (!isAuthenticated) return; // Don't run for unauthenticated users
        
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
    }, [isAuthenticated]);

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

    // Show loading state while session is being fetched
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0066CC]"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            {/* Only show Nav if needed */}
            <Nav />
            
            <div className="flex flex-1">
                {/* Only show Sidebar for authenticated users */}
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