import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-nav";
import TopNavigation from "./top-navigation";
import MobileStatsBar from "@/components/mobile/mobile-stats-bar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Enhanced touch handling for mobile gestures
  useEffect(() => {
    if (!isMobile) return;

    let startX: number;
    let startY: number;
    let isSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwipe = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !startY) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = startX - currentX;
      const diffY = startY - currentY;

      // Detect horizontal swipe (more horizontal than vertical movement)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
        isSwipe = true;
        
        // Swipe right from left edge to open sidebar
        if (startX < 50 && diffX < -100 && !sidebarOpen) {
          setSidebarOpen(true);
        }
        // Swipe left to close sidebar
        else if (diffX > 100 && sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };

    const handleTouchEnd = () => {
      startX = 0;
      startY = 0;
      isSwipe = false;
    };

    // Add touch event listeners for gesture support
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, sidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, sidebarOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 touch-manipulation">
      <TopNavigation onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <MobileStatsBar />
      
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        
        {/* Enhanced Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-300"
              onClick={() => setSidebarOpen(false)}
              style={{ touchAction: 'none' }}
            />
            <div 
              className="fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-out"
              onClick={(e) => e.stopPropagation()}
              style={{ touchAction: 'auto' }}
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}
        
        {/* Main Content with Enhanced Touch Support */}
        <main className={cn(
          "flex-1 p-4 md:p-6 overflow-auto scroll-smooth",
          "touch-pan-y safe-area-inset-bottom",
          isMobile && "pb-20 pt-2", // Extra padding for mobile nav, reduced top padding
          "focus:outline-none"
        )}>
          {children}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNav />}
    </div>
  );
}
