import { useState } from 'react';
import { useAuthStore } from '../store/authStore'; // ✅ Add this
import { 
  Home, 
  Box, 
  Layers, 
  Bell, 
  Moon,
  Sun,
  Settings,
  MoreVertical,
  Store,
  Bookmark,
  Ticket,
  User,
  LogOut
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from './ui/dropdown-menu';

interface AppSidebarProps {
  onNavigate: (view: 'map' | 'list' | 'forum' | 'profile' | 'filters' | 'bookmarks' | 'notifications' | 'settings' | 'vouchers') => void;
  onLogout: () => void;
  currentView?: string;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  notificationCount?: number;
  onThemeToggle?: () => void;
}

export function AppSidebar({ 
  onNavigate, 
  onLogout, 
  currentView,
  userName = "Brooklyn Simmons",
  userEmail = "brooklyn@simmons.com",
  avatarUrl,
  notificationCount = 12,
  isDarkMode = true,
  onThemeToggle
}: AppSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const role = useAuthStore((state) => state.role); // ✅ Get user role
  
  const bgColor = isDarkMode ? '#3a3a3a' : '#ffffff';
  const textColor = isDarkMode ? 'text-white' : 'text-black';
  const secondaryTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-600' : 'border-gray-200';
  const hoverBgColor = isDarkMode ? 'hover:bg-[#404040]' : 'hover:bg-gray-100';
  const avatarBgColor = isDarkMode ? 'bg-gray-600' : 'bg-gray-300';

  // ✅ Define all menu items
  const allMenuItems = [
    { icon: Home, label: 'Home', view: 'map' as const },
    { icon: Box, label: 'Explore', view: 'list' as const },
    { icon: Bookmark, label: 'Bookmarks', view: 'bookmarks' as const },
    { icon: Ticket, label: 'Vouchers', view: 'vouchers' as const, userOnly: true }, // ✅ Add userOnly flag
    { icon: Layers, label: 'Forum', view: 'forum' as const },
  ];

  // ✅ Filter menu items based on role
  const mainMenuItems = allMenuItems.filter(item => {
    if (item.userOnly && role !== 'user') {
      return false; // Hide vouchers for business users
    }
    return true;
  });

  const bottomMenuItems = [
    { icon: Bell, label: 'Notifications', view: 'notifications' as const, hasNotification: true },
    { icon: isDarkMode ? Sun : Moon, label: 'Theme', view: null, isThemeToggle: true },
    { icon: Settings, label: 'Settings', view: 'settings' as const },
  ];

  const handleMenuClick = (
    view: 'map' | 'list' | 'forum' | 'profile' | 'filters' | 'bookmarks' | 'notifications' | 'settings' | 'vouchers' | null, 
    isThemeToggle?: boolean
  ) => {
    if (isThemeToggle && onThemeToggle) {
      onThemeToggle();
    } else if (view) {
      onNavigate(view);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div
      className="fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out z-40 flex flex-col"
      style={{ width: isExpanded ? '280px' : '80px', backgroundColor: bgColor }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        if (!isDropdownOpen) {
          setIsExpanded(false);
        }
      }}
    >
      {/* Logo Section */}
      <div className={`p-4 border-b ${borderColor}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex-shrink-0 bg-[#FFA1A3] rounded-lg flex items-center justify-center">
            <Store className="w-7 h-7 text-white" />
          </div>
          {isExpanded && (
            <div className="overflow-hidden">
              <h1 className={`${textColor} text-xl whitespace-nowrap`}>LocalLoco</h1>
              <p className={`${secondaryTextColor} text-xs whitespace-nowrap overflow-hidden text-ellipsis`}>
                Discover and support local busine...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Menu Items */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          
          return (
            <button
              key={item.label}
              onClick={() => handleMenuClick(item.view)}
              className={`w-full rounded-lg p-3 flex items-center gap-3 transition-colors ${
                isActive 
                  ? 'bg-[#FFA1A3]/20 text-[#FFA1A3]' 
                  : `${secondaryTextColor} ${hoverBgColor} ${isDarkMode ? 'hover:text-white' : 'hover:text-black'}`
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && (
                <span className="text-sm whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Menu Items */}
      <nav className={`px-3 py-4 space-y-1 border-t ${borderColor}`}>
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <button
              key={item.label}
              onClick={() => handleMenuClick(item.view, item.isThemeToggle)}
              className={`w-full rounded-lg p-3 flex items-center gap-3 ${secondaryTextColor} ${hoverBgColor} ${isDarkMode ? 'hover:text-white' : 'hover:text-black'} transition-colors relative`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && (
                <span className="text-sm whitespace-nowrap flex-1 text-left">{item.label}</span>
              )}
              {item.hasNotification && (
                <Badge className="bg-[#FFA1A3] text-white hover:bg-[#FFA1A3] text-xs px-2 absolute right-2">
                  {notificationCount}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className={`p-3 border-t ${borderColor}`}>
        <div className={`w-full rounded-lg p-3 flex items-center gap-3 ${textColor} transition-colors relative`}>
          <button
            onClick={() => handleMenuClick('profile')}
            className={`flex items-center gap-3 ${hoverBgColor} transition-colors rounded-lg flex-1`}
          >
            <div className="relative flex-shrink-0">
              <Avatar className="w-10 h-10">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={userName} />
                ) : (
                  <AvatarFallback className={`${avatarBgColor} ${textColor}`}>
                    {getInitials(userName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2" style={{ borderColor: bgColor }}></div>
            </div>
            {isExpanded && (
              <div className="flex-1 text-left overflow-hidden">
                <p className={`text-sm ${textColor} whitespace-nowrap overflow-hidden text-ellipsis`}>
                  {userName}
                </p>
                <p className={`text-xs ${secondaryTextColor} whitespace-nowrap overflow-hidden text-ellipsis`}>
                  {userEmail}
                </p>
              </div>
            )}
          </button>
          {isExpanded && (
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button 
                  className={`p-1 ${hoverBgColor} rounded transition-colors`}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                >
                  <MoreVertical className={`w-4 h-4 ${secondaryTextColor} flex-shrink-0`} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent 
                  align="end"
                  side="right"
                  sideOffset={8}
                  className="w-56"
                  style={{ 
                    backgroundColor: bgColor,
                    borderColor: isDarkMode ? '#404040' : '#e5e7eb',
                    zIndex: 9999
                  }}
                  onCloseAutoFocus={(e: Event) => e.preventDefault()}
                >
                  <DropdownMenuLabel className={textColor}>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator style={{ backgroundColor: isDarkMode ? '#404040' : '#e5e7eb' }} />
                  <DropdownMenuItem 
                    onClick={(e: Event) => {
                      e.preventDefault();
                      setIsDropdownOpen(false);
                      handleMenuClick('profile');
                    }}
                    className={`${textColor} ${hoverBgColor} cursor-pointer`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span>View Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e: Event) => {
                      e.preventDefault();
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                    className={`${textColor} ${hoverBgColor} cursor-pointer`}
                  >
                    <LogOut className="w-4 h-4 mr-2 text-red-500" />
                    <span className="text-red-500">Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
