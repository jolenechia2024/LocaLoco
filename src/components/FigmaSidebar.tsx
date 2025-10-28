import React, { useState } from 'react';
import FigmaSidebarComponent from '../imports/Sidebar-4001-511';

interface FigmaSidebarProps {
  onNavigate: (view: 'map' | 'list' | 'forum' | 'profile' | 'filters') => void;
  onLogout: () => void;
  currentView?: string;
  notificationCount?: number;
  userName?: string;
  userEmail?: string;
}

export function FigmaSidebar({ 
  onNavigate, 
  onLogout, 
  currentView,
  notificationCount = 0,
  userName = "Brooklyn Simmons",
  userEmail = "brooklyn@simmons.com"
}: FigmaSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="fixed left-0 top-0 h-screen z-50 transition-all duration-300 ease-in-out"
      style={{ width: isExpanded ? '240px' : '80px' }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div 
        className="h-full bg-gray-900 shadow-2xl overflow-hidden relative"
        onClick={(e) => {
          // Intercept clicks and route them appropriately
          const target = e.target as HTMLElement;
          const menuItem = target.closest('[data-name="menu-items"]');
          
          if (menuItem) {
            const text = menuItem.textContent?.trim().toLowerCase();
            
            if (text?.includes('home')) {
              onNavigate('map');
            } else if (text?.includes('explore')) {
              onNavigate('list');
            } else if (text?.includes('forum')) {
              onNavigate('forum');
            } else if (text?.includes('filter')) {
              onNavigate('filters');
            } else if (text?.includes('notification')) {
              console.log('Show notifications');
            } else if (text?.includes('support')) {
              console.log('Show support');
            } else if (text?.includes('settings')) {
              console.log('Show settings');
            }
          }
          
          // Handle profile widget click
          const profileWidget = target.closest('[data-name="profile-widget"]');
          if (profileWidget) {
            onNavigate('profile');
          }
        }}
      >
        <div className="absolute inset-0" style={{ 
          transform: isExpanded ? 'scale(1)' : 'scale(0.9)',
          transformOrigin: 'left center',
          transition: 'transform 0.3s ease-in-out'
        }}>
          <FigmaSidebarComponent />
        </div>
      </div>
      
      {/* Custom styles for hover state */}
      <style>{`
        [data-name="sidebar"] {
          height: 100%;
          width: 100%;
          background: #1f2937;
        }
        
        /* Header should always show icon, text only when expanded */
        [data-name="header"] {
          overflow: visible !important;
        }
        
        [data-name="header"] h2 {
          opacity: ${isExpanded ? '1' : '0'};
          transition: opacity 0.3s ease-in-out;
          white-space: nowrap;
          ${!isExpanded ? 'width: 0; overflow: hidden;' : ''}
        }
        
        [data-name="header"] p {
          opacity: ${isExpanded ? '1' : '0'};
          transition: opacity 0.3s ease-in-out;
          ${!isExpanded ? 'width: 0; overflow: hidden;' : ''}
        }
        
        /* Show/hide text based on expanded state */
        [data-name="sidebar"] p:not([data-name="header"] p) {
          opacity: ${isExpanded ? '1' : '0'};
          transition: opacity 0.3s ease-in-out;
          white-space: nowrap;
          overflow: hidden;
          ${!isExpanded ? 'width: 0;' : ''}
        }
        
        /* Menu items hover effect */
        [data-name="menu-items"] {
          cursor: pointer;
          padding: 12px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 8px;
        }
        
        [data-name="menu-items"]:hover {
          background-color: rgba(255, 161, 163, 0.15);
        }
        
        /* Profile widget hover effect */
        [data-name="profile-widget"] {
          cursor: pointer;
          padding: 12px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
          margin: 8px;
        }
        
        [data-name="profile-widget"]:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        /* Search field styling */
        [data-name="search-field"] {
          cursor: pointer;
          padding: 12px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
          margin: 8px;
        }
        
        [data-name="search-field"]:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        /* Icons should always be visible */
        [data-name="menu-items"] > div:first-child,
        [data-name="search-field"] > div:first-child {
          flex-shrink: 0;
        }

        /* Notification badge */
        [data-name="notification"] {
          flex-shrink: 0;
        }

        /* Avatar and status */
        [data-name="avatar"],
        [data-name="status"] {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
