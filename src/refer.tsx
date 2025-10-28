import React, { useState, useMemo, useEffect } from "react";
import {
  MapPin,
  Bookmark as BookmarkIcon,
  Store,
  TrendingUp,
  Calendar,
  User,
  MessageCircle,
} from "lucide-react";
import { Business, BookmarkedBusiness } from "./types/business";
import { User as UserType } from "./types/user";
import {
  AuthState,
  UserRole,
  BusinessVerificationData,
} from "./types/auth";
import {
  mockBusinesses,
  mockReviews,
  mockEvents,
} from "./data/mockData";
import { mockUser } from "./data/mockUserData";
import { mockBusinessOwner } from "./data/mockBusinessOwnerData";
import { BusinessOwner } from "./data/mockBusinessOwnerData";
import { SearchBar } from "./components/SearchBar";
import { BusinessCard } from "./components/BusinessCard";
import { BusinessDetail } from "./components/BusinessDetail";
import { ProfilePage } from "./components/pages/ProfilePage";
import { BusinessProfilePage } from "./components/pages/BusinessProfilePage";
import { PopularBusinessesPopup } from "./components/PopularBusinessesPopup";
import { EventsPopup } from "./components/EventsPopup";
import { WelcomeModal } from "./components/pages/WelcomeModal";
import { LoginPage } from "./components/pages/LoginPage";
import { SignupPage } from "./components/pages/SignupPage";
import { BusinessVerification } from "./components/pages/BusinessVerification";
import { ForumPage } from "./components/ForumPage";
import { MapDiscoveryPage } from "./components/MapDiscoveryPage";
import { AppSidebar } from "./components/AppSidebar";
import { FiltersPanel } from "./components/FiltersPanel";
import { Button } from "./components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { Badge } from "./components/ui/badge";
import { Toaster } from "./components/ui/sonner";
import { checkBusinessOpenStatus } from "./utils/businessUtils";
import { SettingsPage } from "./components/SettingsPage";
import { NotificationsPage } from "./components/NotificationsPage";
import { WriteReviewPage } from "./components/WriteReviewPage";
import { VouchersPage } from "./components/VouchersPage";
import { ErrorPage } from "./components/pages/ErrorPage"; // ADDED


type AppView =
  | "welcome"
  | "login"
  | "signup"
  | "verification"
  | "map"
  | "list"
  | "404"; // ADDED


export default function App() {
  const [currentView, setCurrentView] =
    useState<AppView>("welcome");
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    userId: null,
  });
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [selectedBusiness, setSelectedBusiness] =
    useState<Business | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    string[]
  >([]);
  const [selectedPrices, setSelectedPrices] = useState<
    string[]
  >([]);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [bookmarkedBusinesses, setBookmarkedBusinesses] =
    useState<BookmarkedBusiness[]>([]);
  const [showPopularPopup, setShowPopularPopup] =
    useState(false);
  const [showEventsPopup, setShowEventsPopup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showForum, setShowForum] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] =
    useState(true);
  const [user, setUser] = useState<UserType>(mockUser);
  const [businessOwner, setBusinessOwner] = useState<BusinessOwner>(mockBusinessOwner);
  const [pendingBusinessData, setPendingBusinessData] =
    useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviewBusiness, setReviewBusiness] = useState<Business | null>(null);
  const [showVouchers, setShowVouchers] = useState(false);
  const [vouchersInitialTab, setVouchersInitialTab] = useState<'available' | 'my-vouchers'>('available');
  const [userLoyaltyPoints, setUserLoyaltyPoints] = useState(450);
  const [show404, setShow404] = useState(false); // ADDED

  // Show popups on first load (only when authenticated and on map view)
  useEffect(() => {
    if (authState.isAuthenticated && currentView === "map") {
      const timer1 = setTimeout(
        () => setShowEventsPopup(true),
        1000,
      );

      return () => {
        clearTimeout(timer1);
      };
    }
  }, [authState.isAuthenticated, currentView]);

  // Filter businesses based on search criteria
  const filteredBusinesses = useMemo(() => {
    return mockBusinesses.filter((business) => {
      const matchesSearch =
        business.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        business.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        business.address
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(business.category);
      const matchesPrice =
        selectedPrices.length === 0 ||
        selectedPrices.includes(business.priceRange);

      // Check if business is open now
      let matchesOpenStatus = true;
      if (openNowOnly) {
        const openStatus = checkBusinessOpenStatus(business);
        matchesOpenStatus = openStatus.isOpen;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesOpenStatus
      );
    });
  }, [
    searchTerm,
    selectedCategories,
    selectedPrices,
    openNowOnly,
  ]);

  // Get bookmarked businesses
  const bookmarkedBusinessList = useMemo(() => {
    const bookmarkedIds = bookmarkedBusinesses.map(
      (b) => b.businessId,
    );
    return mockBusinesses.filter((business) =>
      bookmarkedIds.includes(business.id),
    );
  }, [bookmarkedBusinesses]);

  const displayedBusinesses =
    activeTab === "bookmarked"
      ? bookmarkedBusinessList
      : filteredBusinesses;

  const handleBookmarkToggle = (businessId: string) => {
    setBookmarkedBusinesses((prev) => {
      const isBookmarked = prev.some(
        (b) => b.businessId === businessId,
      );
      if (isBookmarked) {
        return prev.filter((b) => b.businessId !== businessId);
      } else {
        return [
          ...prev,
          {
            businessId,
            dateBookmarked: new Date().toISOString(),
          },
        ];
      }
    });
  };

  const isBookmarked = (businessId: string) => {
    return bookmarkedBusinesses.some(
      (b) => b.businessId === businessId,
    );
  };

  // Calculate user stats
  const userStats = useMemo(() => {
    return {
      vouchersCount: Math.floor(Math.random() * 10) + 3,
      reviewsCount: mockReviews.filter(
        (r) => r.userId === user.id,
      ).length,
      loyaltyPoints: userLoyaltyPoints,
    };
  }, [bookmarkedBusinesses, user.id, userLoyaltyPoints]);

  // Auth handlers
  const handleLogin = (
    email: string,
    password: string,
    role: UserRole,
  ): boolean => {
    console.log("Login:", { email, password, role });
    
    const mockValidCredentials = [
      { email: 'user@test.com', password: 'password123', role: 'user' },
      { email: 'business@test.com', password: 'password123', role: 'business' },
      { email: '123456789A', password: 'password123', role: 'business' },
    ];
    
    if (email && password) {
      setAuthState({
        isAuthenticated: true,
        role,
        userId: role === "business" ? "business-1" : "user-1",
      });
      setCurrentView("map");
      setShowWelcomeModal(false);
      return true;
    }
    
    return false;
  };

  const handleSignup = (data: any, role: UserRole) => {
    console.log("Signup:", { data, role });

    setAuthState({
      isAuthenticated: true,
      role,
      userId: role === "business" ? "business-1" : "user-1",
    });
    setCurrentView("map");
    setShowWelcomeModal(false);
  };

  const handleBusinessVerification = (
    data: BusinessVerificationData,
  ) => {
    console.log("Business verification:", {
      ...pendingBusinessData,
      ...data,
    });
    setAuthState({
      isAuthenticated: true,
      role: "business",
      userId: "business-1",
    });
    setCurrentView("map");
    setShowWelcomeModal(false);
  };

  const handleSkipVerification = () => {
    setAuthState({
      isAuthenticated: true,
      role: "business",
      userId: "business-1",
    });
    setCurrentView("map");
    setShowWelcomeModal(false);
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      role: null,
      userId: null,
    });
    setCurrentView("welcome");
    setShowWelcomeModal(true);
    setShowProfile(false);
    setShowForum(false);
    setSelectedBusiness(null);
  };

  const handleSubmitReview = (rating: number, comment: string) => {
    console.log("Review submitted:", {
      businessId: reviewBusiness?.id,
      rating,
      comment,
      userId: authState.userId,
    });
  };

  const handleRedeemVoucher = (voucherId: string, pointsCost: number) => {
    setUserLoyaltyPoints(prev => prev - pointsCost);
    console.log("Voucher redeemed:", { voucherId, pointsCost });
  };

  const handleSidebarNavigate = (
    view: "map" | "list" | "forum" | "profile" | "filters" | "bookmarks" | "notifications" | "settings" | "vouchers",
  ) => {
    setSelectedBusiness(null);
    setShowProfile(false);
    setShowForum(false);
    setShowFilters(false);
    setShowBookmarks(false);
    setShowSettings(false);
    setShowNotifications(false);
    setShowWriteReview(false);
    setShowVouchers(false);
    setVouchersInitialTab('available');

    if (view === "map") {
      setCurrentView("map");
    } else if (view === "list") {
      setCurrentView("list");
    } else if (view === "forum") {
      setShowForum(true);
    } else if (view === "profile") {
      setShowProfile(true);
    } else if (view === "filters") {
      setShowFilters(true);
    } else if (view === "bookmarks") {
      setShowBookmarks(true);
    } else if (view === "notifications") {
      setShowNotifications(true);
    } else if (view === "settings") {
      setShowSettings(true);
    } else if (view === "vouchers") {
      setShowVouchers(true);
    }
  };

  // Render appropriate view
  if (currentView === "login") {
    return (
      <LoginPage
        onLogin={handleLogin}
        onBack={() => {
          setCurrentView("welcome");
          setShowWelcomeModal(true);
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  if (currentView === "signup") {
    return (
      <SignupPage
        onSignup={handleSignup}
        onBack={() => {
          setCurrentView("welcome");
          setShowWelcomeModal(true);
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  if (currentView === "verification") {
    return (
      <BusinessVerification
        onSubmit={handleBusinessVerification}
        onSkip={handleSkipVerification}
        isDarkMode={isDarkMode}
      />
    );
  }

  // ADDED: 404 Error Page
  if (currentView === "404" || show404) {
    return (
      <ErrorPage
        onGoHome={() => {
          setShow404(false);
          setCurrentView("map");
          setShowWelcomeModal(false);
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Welcome screen with modal
  if (currentView === "welcome" && !authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-orange-50 relative">
        <div className="absolute inset-0 opacity-10">
          <svg
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#FFA1A3"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#grid)"
            />
          </svg>
        </div>

        <header
          className="shadow-md relative z-10"
          style={{
            backgroundColor: isDarkMode ? "#3a3a3a" : "#ffffff",
            color: isDarkMode ? "#ffffff" : "#000000",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">LocalLoco</h1>
                <p className="text-sm opacity-90">
                  Discover and support local businesses in your
                  community - or nearby you!
                </p>
              </div>
            </div>
          </div>
        </header>

        <WelcomeModal
          open={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          onLogin={() => setCurrentView("login")}
          onSignUp={() => setCurrentView("signup")}
        />
      </div>
    );
  }

  // Main app views (authenticated)
  if (showForum) {
    return (
      <>
        <Toaster isDarkMode={isDarkMode} />
        <AppSidebar
          onNavigate={handleSidebarNavigate}
          onLogout={handleLogout}
          currentView="forum"
          userName={authState.role === 'business' ? businessOwner.businessName : user.name}
          userEmail={authState.role === 'business' ? businessOwner.businessEmail : user.email}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        />
        <div className="ml-20">
          <ForumPage
            onBack={() => setShowForum(false)}
            isDarkMode={isDarkMode}
          />
        </div>
      </>
    );
  }

  if (showProfile) {
    return (
      <>
        <Toaster isDarkMode={isDarkMode} />
        <AppSidebar
          onNavigate={handleSidebarNavigate}
          onLogout={handleLogout}
          currentView="profile"
          userName={authState.role === 'business' ? businessOwner.businessName : user.name}
          userEmail={authState.role === 'business' ? businessOwner.businessEmail : user.email}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        />
        <div className="ml-20">
          {authState.role === 'business' ? (
            <BusinessProfilePage
              businessOwner={businessOwner}
              onBack={() => setShowProfile(false)}
              onUpdateBusiness={setBusinessOwner}
              isDarkMode={isDarkMode}
            />
          ) : (
            <ProfilePage
              user={user}
              stats={userStats}
              bookmarkedBusinesses={bookmarkedBusinessList}
              onBack={() => setShowProfile(false)}
              onUpdateUser={setUser}
              onViewBusinessDetails={setSelectedBusiness}
              onBookmarkToggle={handleBookmarkToggle}
              onNavigateToVouchers={() => {
                setShowProfile(false);
                setVouchersInitialTab('my-vouchers');
                setShowVouchers(true);
              }}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </>
    );
  }

  if (showBookmarks) {
    return (
      <>
        <Toaster isDarkMode={isDarkMode} />
        <AppSidebar
          onNavigate={handleSidebarNavigate}
          onLogout={handleLogout}
          currentView="bookmarks"
          userName={authState.role === 'business' ? businessOwner.businessName : user.name}
          userEmail={authState.role === 'business' ? businessOwner.businessEmail : user.email}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        />
        <div className="ml-20">
          <div className="min-h-screen" style={{ backgroundColor: isDarkMode ? "#3a3a3a" : "#f9fafb" }}>
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="mb-6">
                <h1 className="text-3xl mb-2" style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>
                  My Bookmarks
                </h1>
                <p className="text-muted-foreground">
                  Your saved businesses
                </p>
              </div>
              {bookmarkedBusinessList.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {bookmarkedBusinessList.map((business) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      isBookmarked={true}
                      onBookmarkToggle={handleBookmarkToggle}
                      onViewDetails={setSelectedBusiness}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookmarkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg mb-2" style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>No bookmarked businesses</h3>
                  <p className="text-muted-foreground mb-4">
                    Start exploring and bookmark your favorite local businesses!
                  </p>
                  <Button onClick={() => handleSidebarNavigate("list")} className="bg-primary text-white hover:bg-primary/90">
                    Browse Businesses
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (showNotifications) {
    return (
      <>
        <Toaster isDarkMode={isDarkMode} />
        <AppSidebar
          onNavigate={handleSidebarNavigate}
          onLogout={handleLogout}
          currentView="notifications"
          userName={authState.role === 'business' ? businessOwner.businessName : user.name}
          userEmail={authState.role === 'business' ? businessOwner.businessEmail : user.email}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        />
        <div className="ml-20">
          <NotificationsPage
            onBack={() => setShowNotifications(false)}
            isDarkMode={isDarkMode}
          />
        </div>
      </>
    );
  }

  if (showVouchers) {
    return (
      <>
        <Toaster isDarkMode={isDarkMode} />
        <AppSidebar
          onNavigate={handleSidebarNavigate}
          onLogout={handleLogout}
          currentView="list"
          userName={authState.role === 'business' ? businessOwner.businessName : user.name}
          userEmail={authState.role === 'business' ? businessOwner.businessEmail : user.email}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        />
        <div className="ml-20">
          <VouchersPage
            onBack={() => {
              setShowVouchers(false);
              setVouchersInitialTab('available');
            }}
            isDarkMode={isDarkMode}
            currentPoints={userLoyaltyPoints}
            onRedeemVoucher={handleRedeemVoucher}
            initialTab={vouchersInitialTab}
          />
        </div>
      </>
    );
  }

  if (showSettings) {
    return (
      <>
        <Toaster isDarkMode={isDarkMode} />
        <AppSidebar
          onNavigate={handleSidebarNavigate}
          onLogout={handleLogout}
          currentView="settings"
          userName={authState.role === 'business' ? businessOwner.businessName : user.name}
          userEmail={authState.role === 'business' ? businessOwner.businessEmail : user.email}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        />
        <div className="ml-20">
          <SettingsPage
            onBack={() => setShowSettings(false)}
            isDarkMode={isDarkMode}
            onThemeToggle={() => setIsDarkMode(!isDarkMode)}
          />
        </div>
      </>
    );
  }

  if (showWriteReview && reviewBusiness) {
    return (
      <>
        <Toaster isDarkMode={isDarkMode} />
        <AppSidebar
          onNavigate={handleSidebarNavigate}
          onLogout={handleLogout}
          currentView="list"
          userName={authState.role === 'business' ? businessOwner.businessName : user.name}
          userEmail={authState.role === 'business' ? businessOwner.businessEmail : user.email}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        />
        <div className="ml-20">
          <div className="min-h-screen" style={{ backgroundColor: isDarkMode ? "#3a3a3a" : "#f9fafb" }}>
            <WriteReviewPage
              business={reviewBusiness}
              onBack={() => {
                setShowWriteReview(false);
                setReviewBusiness(null);
              }}
              onSubmit={handleSubmitReview}
              userAvatar={user.avatar}
              userName={user.name}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </>
    );
  }

  if (selectedBusiness) {
    return (
      <>
        <Toaster isDarkMode={isDarkMode} />
        <AppSidebar
          onNavigate={handleSidebarNavigate}
          onLogout={handleLogout}
          userName={authState.role === 'business' ? businessOwner.businessName : user.name}
          userEmail={authState.role === 'business' ? businessOwner.businessEmail : user.email}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        />
        <div
          className="min-h-screen p-4 ml-20"
          style={{
            backgroundColor: isDarkMode ? "#3a3a3a" : "#f9fafb",
          }}
        >
          <BusinessDetail
            business={selectedBusiness}
            reviews={mockReviews}
            isBookmarked={isBookmarked(selectedBusiness.id)}
            onBookmarkToggle={handleBookmarkToggle}
            onBack={() => setSelectedBusiness(null)}
            onWriteReview={(business) => {
              setReviewBusiness(business);
              setShowWriteReview(true);
              setSelectedBusiness(null);
            }}
            isDarkMode={isDarkMode}
          />
        </div>
      </>
    );
  }

  // Map Discovery Page
  if (currentView === "map" && authState.isAuthenticated) {
    return (
      <>
        <Toaster isDarkMode={isDarkMode} />
        <AppSidebar
          onNavigate={handleSidebarNavigate}
          onLogout={handleLogout}
          currentView="map"
          userName={authState.role === 'business' ? businessOwner.businessName : user.name}
          userEmail={authState.role === 'business' ? businessOwner.businessEmail : user.email}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        />
        <MapDiscoveryPage
          businesses={mockBusinesses}
          onViewProfile={() => setShowProfile(true)}
          onViewForum={() => setShowForum(true)}
          onLogout={handleLogout}
          onBusinessClick={setSelectedBusiness}
          isDarkMode={isDarkMode}
        />
      </>
    );
  }

  // List View Page
  return (
    <>
      <Toaster isDarkMode={isDarkMode} />
      <AppSidebar
        onNavigate={handleSidebarNavigate}
        onLogout={handleLogout}
        currentView="list"
        userName={authState.role === 'business' ? businessOwner.businessName : user.name}
        userEmail={authState.role === 'business' ? businessOwner.businessEmail : user.email}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
      />
      <div
        className="min-h-screen ml-20"
        style={{
          backgroundColor: isDarkMode ? "#3a3a3a" : "#f9fafb",
        }}
      >
        <EventsPopup
          open={showEventsPopup}
          onClose={() => setShowEventsPopup(false)}
          events={mockEvents}
          isDarkMode={isDarkMode}
        />

        {showFilters && (
          <FiltersPanel
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
            selectedPrices={selectedPrices}
            onPricesChange={setSelectedPrices}
            openNowOnly={openNowOnly}
            onOpenNowChange={setOpenNowOnly}
            onClose={() => setShowFilters(false)}
          />
        )}

        <header
          className="shadow-sm sticky top-0 z-10"
          style={{
            backgroundColor: isDarkMode ? "#3a3a3a" : "#ffffff",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              selectedPrices={selectedPrices}
              onPricesChange={setSelectedPrices}
              openNowOnly={openNowOnly}
              onOpenNowChange={setOpenNowOnly}
              isDarkMode={isDarkMode}
            />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <TabsList
                style={{
                  backgroundColor: isDarkMode
                    ? "#2a2a2a"
                    : undefined,
                }}
              >
                <TabsTrigger
                  value="all"
                  className={`flex items-center gap-2 ${isDarkMode ? "data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-gray-400" : ""}`}
                >
                  <MapPin className="w-4 h-4" />
                  All Businesses
                  <Badge
                    variant="secondary"
                    className={`ml-2 ${isDarkMode ? "bg-[#3a3a3a] text-white" : ""}`}
                  >
                    {filteredBusinesses.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="bookmarked"
                  className={`flex items-center gap-2 ${isDarkMode ? "data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-gray-400" : ""}`}
                >
                  <BookmarkIcon className="w-4 h-4" />
                  Bookmarked
                  <Badge
                    variant="secondary"
                    className={`ml-2 ${isDarkMode ? "bg-[#3a3a3a] text-white" : ""}`}
                  >
                    {bookmarkedBusinesses.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all">
              {filteredBusinesses.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredBusinesses.map((business) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      isBookmarked={isBookmarked(business.id)}
                      onBookmarkToggle={handleBookmarkToggle}
                      onViewDetails={setSelectedBusiness}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg mb-2" style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>
                    No businesses found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or browse
                    all businesses.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategories([]);
                      setSelectedPrices([]);
                    }}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="bookmarked">
              {bookmarkedBusinessList.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {bookmarkedBusinessList.map((business) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      isBookmarked={true}
                      onBookmarkToggle={handleBookmarkToggle}
                      onViewDetails={setSelectedBusiness}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookmarkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg mb-2" style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>
                    No bookmarked businesses
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start exploring and bookmark your favorite
                    local businesses!
                  </p>
                  <Button onClick={() => setActiveTab("all")} className="bg-primary text-white hover:bg-primary/90">
                    Browse Businesses
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
