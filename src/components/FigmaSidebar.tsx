import { useState, useEffect } from 'react';
import FigmaSidebarComponent from '../imports/Sidebar-4001-511';

interface FigmaSidebarProps {
  onNavigate: (view: 'map' | 'list' | 'forum' | 'profile' | 'filters') => void;
  onLogout: () => void;
  currentView?: string;
  notificationCount?: number;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
}

function getInitials(name: string = '') {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

export function FigmaSidebar({ 
  onNavigate, 
  onLogout, 
  currentView,
  notificationCount = 0,
  userName = "Brooklyn Simmons",
  userEmail = "brooklyn@simmons.com",
  avatarUrl
}: FigmaSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    console.log('🎨 FigmaSidebar user updated:', { userName, userEmail, avatarUrl: avatarUrl?.substring(0, 30) });
  }, [userName, userEmail, avatarUrl]);

  return (
    <div
      className="fixed left-0 top-0 h-screen z-50 transition-all duration-300 ease-in-out"
      style={{ width: isExpanded ? '240px' : '80px' }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div 
        className="h-full bg-gray-900 shadow-2xl overflow-hidden relative"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
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
            } else if (text?.includes('logout')) {
              onLogout();
            }
          }
          
          const profileWidget = target.closest('[data-name="profile-widget"]');
          if (profileWidget) {
            onNavigate('profile');
          }
        }}
      >
        {/* Figma Component Background */}
        <div className="absolute inset-0" style={{ 
          transform: isExpanded ? 'scale(1)' : 'scale(0.9)',
          transformOrigin: 'left center',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 1
        }}>
          <FigmaSidebarComponent />
        </div>

        {/* User Info Overlay - Always on top */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-3 bg-gray-900 border-t border-gray-700"
          style={{ zIndex: 100 }}
        >
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              onNavigate('profile');
            }}
            title={`${userName}\n${userEmail}`}
          >
            {/* Avatar */}
            {avatarUrl ? (
              <img
                key={avatarUrl}
                src={avatarUrl}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-700 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-10 h-10 rounded-full bg-gradient-to-br from-[#FFA1A3] to-pink-500 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0 ${avatarUrl ? 'hidden' : ''}`}
            >
              {getInitials(userName)}
            </div>

            {/* User Info - show when expanded */}
            {isExpanded && (
              <div className="flex flex-col overflow-hidden flex-1">
                <div className="font-semibold text-white text-sm truncate">
                  {userName}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {userEmail}
                </div>
              </div>
            )}
          </div>

          {/* Notification badge */}
          {isExpanded && notificationCount > 0 && (
            <div className="mt-2 px-2 py-1 bg-[#FFA1A3] rounded-full text-white text-xs text-center">
              {notificationCount} new notification{notificationCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
      
      {/* Custom styles */}
      <style>{`
        [data-name="sidebar"] {
          height: 100%;
          width: 100%;
          background: #1f2937;
        }
        
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
        
        [data-name="sidebar"] p:not([data-name="header"] p) {
          opacity: ${isExpanded ? '1' : '0'};
          transition: opacity 0.3s ease-in-out;
          white-space: nowrap;
          overflow: hidden;
          ${!isExpanded ? 'width: 0;' : ''}
        }
        
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
        
        /* Hide original profile widget */
        [data-name="profile-widget"] {
          display: none !important;
        }
        
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

        [data-name="menu-items"] > div:first-child,
        [data-name="search-field"] > div:first-child {
          flex-shrink: 0;
        }

        [data-name="notification"] {
          flex-shrink: 0;
        }

        [data-name="avatar"],
        [data-name="status"] {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
