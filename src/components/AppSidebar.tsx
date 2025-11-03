import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
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
  LogOut,
  LogIn
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { useThemeStore } from '../store/themeStore';


interface AppSidebarProps {
  onNavigate: (view: 'map' | 'list' | 'forum' | 'profile' | 'filters' | 'bookmarks' | 'notifications' | 'settings' | 'vouchers') => void;
  onLogout: () => void;
  currentView?: string;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  notificationCount?: number;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  isAuthenticated?: boolean;
}


export function AppSidebar({
  onNavigate,
  onLogout,
  currentView,
  userName = "User",
  userEmail = "user@example.com",
  avatarUrl,
  notificationCount = 0,
  onThemeToggle,
  isAuthenticated = true
}: AppSidebarProps) {
  const navigate = useNavigate();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const role = useAuthStore((state) => state.role);
  
  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on mount
    checkMobile();
    
    // Add listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const bgColor = isDarkMode ? '#3a3a3a' : '#ffffff';
  const textColor = isDarkMode ? 'text-white' : 'text-black';
  const secondaryTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-600' : 'border-gray-200';
  const hoverBgColor = isDarkMode ? 'hover:bg-[#404040]' : 'hover:bg-gray-100';
  const avatarBgColor = isDarkMode ? 'bg-gray-600' : 'bg-gray-300';


  const allMenuItems = [
    { icon: Home, label: 'Home', view: 'map' as const },
    { icon: Box, label: 'Explore', view: 'list' as const },
    { icon: Bookmark, label: 'Bookmarks', view: 'bookmarks' as const, requiresAuth: true },
    { icon: Ticket, label: 'Vouchers', view: 'vouchers' as const, userOnly: true, requiresAuth: true },
    { icon: Layers, label: 'Forum', view: 'forum' as const, requiresAuth: true },
  ];


  const mainMenuItems = allMenuItems.filter(item => {
    if (item.userOnly && role !== 'user') {
      return false;
    }
    return true;
  });


  const bottomMenuItems = [
    { icon: Bell, label: 'Notifications', view: 'notifications' as const, hasNotification: notificationCount > 0, requiresAuth: true },
    { icon: isDarkMode ? Sun : Moon, label: 'Theme', view: null, isThemeToggle: true },
    { icon: Settings, label: 'Settings', view: 'settings' as const, requiresAuth: true },
  ];


  const handleMenuClick = (
    view: 'map' | 'list' | 'forum' | 'profile' | 'filters' | 'bookmarks' | 'notifications' | 'settings' | 'vouchers' | null,
    isThemeToggle?: boolean,
    requiresAuth?: boolean
  ) => {
    if (isThemeToggle && onThemeToggle) {
      onThemeToggle();
    } else if (view) {
      if (requiresAuth && !isAuthenticated) {
        setShowLoginPrompt(true);
      } else {
        onNavigate(view);
      }
    }
  };


  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };


  // Combine all menu items for mobile view
  const allBottomNavItems = [
    ...mainMenuItems.filter(item => item.view !== 'vouchers'), // Remove vouchers from mobile
    { icon: Bell, label: 'Notifications', view: 'notifications' as const, hasNotification: notificationCount > 0, requiresAuth: true },
    ...(isAuthenticated
      ? [{ icon: null, label: 'Profile', view: 'profile' as const, isAvatar: true }]
      : [{ icon: LogIn, label: 'Login', view: null as const, isLoginButton: true }]
    ),
    { icon: Settings, label: 'Settings', view: 'settings' as const, requiresAuth: true },
  ];

  return (
    <>
      {/* Desktop Sidebar - only render on desktop */}
      {!isMobile && (
        <div
          className="fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out z-40"
          style={{ width: isExpanded ? '280px' : '80px', backgroundColor: bgColor }}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => {
            if (!isDropdownOpen) {
              setIsExpanded(false);
            }
          }}
        >
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

          <nav className="flex-1 px-3 py-2 space-y-1">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              const isDisabled = 'requiresAuth' in item && item.requiresAuth && !isAuthenticated;

              return (
                <button
                  key={item.label}
                  onClick={() => handleMenuClick(item.view, false, 'requiresAuth' in item ? item.requiresAuth : false)}
                  className={`w-full rounded-lg p-3 flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-[#FFA1A3]/20 text-[#FFA1A3]'
                      : isDisabled
                      ? `opacity-25 cursor-not-allowed ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`
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

          <nav className={`px-3 py-4 space-y-1 border-t ${borderColor}`}>
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;
              const isDisabled = 'requiresAuth' in item && item.requiresAuth && !isAuthenticated;

              return (
                <button
                  key={item.label}
                  onClick={() => handleMenuClick(item.view, item.isThemeToggle, 'requiresAuth' in item ? item.requiresAuth : false)}
                  className={`w-full rounded-lg p-3 flex items-center gap-3 transition-colors relative ${
                    isDisabled
                      ? `opacity-25 cursor-not-allowed ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`
                      : `${secondaryTextColor} ${hoverBgColor} ${isDarkMode ? 'hover:text-white' : 'hover:text-black'}`
                  }`}
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

          {!isAuthenticated && (
            <div className={`p-3 border-t ${borderColor}`}>
              <button
                onClick={() => navigate('/login')}
                className={`w-full rounded-lg p-3 flex items-center justify-center gap-2 bg-[#FFA1A3] hover:bg-[#FF8A8C] text-white transition-colors`}
              >
                <LogIn className="w-5 h-5 flex-shrink-0" />
                {isExpanded && <span className="text-sm font-medium whitespace-nowrap">Login / Sign Up</span>}
              </button>
            </div>
          )}

          {isAuthenticated && (
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
                        onClick={(e) => {
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
                        onClick={(e) => {
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
          )}
        </div>
      )}

      {/* Mobile Bottom Navigation - only render on mobile */}
      {isMobile && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 border-t safe-area-inset-bottom"
          style={{
            backgroundColor: bgColor,
            borderTopColor: isDarkMode ? '#404040' : '#e5e7eb',
            width: '100%',
            maxWidth: '100vw'
          }}
        >
          <div 
            className="px-2 py-3"
            style={{ 
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollbarWidth: 'thin',
              scrollbarColor: isDarkMode ? '#404040 transparent' : '#e5e7eb transparent',
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: 'auto',
              width: '100%'
            }}
          >
            <div className="inline-flex gap-1" style={{ whiteSpace: 'nowrap' }}>
              {allBottomNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;
                const isThemeToggle = 'isThemeToggle' in item && item.isThemeToggle;
                const hasNotification = 'hasNotification' in item && item.hasNotification;
                const isAvatar = 'isAvatar' in item && item.isAvatar;
                const isLoginButton = 'isLoginButton' in item && item.isLoginButton;
                const isDisabled = 'requiresAuth' in item && item.requiresAuth && !isAuthenticated;

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (isLoginButton) {
                        navigate('/login');
                      } else {
                        handleMenuClick(item.view, isThemeToggle, 'requiresAuth' in item ? item.requiresAuth : false);
                      }
                    }}
                    className={`inline-flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors relative ${
                      isActive
                        ? 'bg-[#FFA1A3]/20 text-[#FFA1A3]'
                        : isDisabled
                        ? `opacity-25 cursor-not-allowed ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`
                        : `${secondaryTextColor} active:bg-gray-100 ${isDarkMode ? 'active:bg-gray-700' : ''}`
                    }`}
                    style={{ minWidth: '64px', flexShrink: 0 }}
                  >
                    {isAvatar ? (
                      <Avatar className="w-6 h-6">
                        {avatarUrl ? (
                          <AvatarImage src={avatarUrl} alt={userName} />
                        ) : (
                          <AvatarFallback className={`${avatarBgColor} ${textColor} text-xs`}>
                            {getInitials(userName)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    ) : (
                      Icon && <Icon className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="text-xs mt-1 whitespace-nowrap">{item.label}</span>
                    {hasNotification && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-[#FFA1A3] rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in Required</DialogTitle>
            <DialogDescription>
              Sign in to access our full services including bookmarks, notifications, forum, and more.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setShowLoginPrompt(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowLoginPrompt(false);
                navigate('/login');
              }}
              className="bg-[#FFA1A3] hover:bg-[#FF8A8C] text-white"
            >
              Sign In
            </Button>
            <Button
              onClick={() => {
                setShowLoginPrompt(false);
                navigate('/signup');
              }}
              variant="outline"
            >
              Sign Up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}