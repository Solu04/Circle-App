"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  Settings,
  Trophy,
  Bell,
  Menu,
  X,
  Home,
  Users,
  Target,
  Plus,
  Building2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/features/auth/AuthModal";
import Button from "@/components/Button";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Refs for click outside detection
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      setShowMobileMenu(false);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setShowMobileMenu(false); // Close mobile menu when opening auth modal
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Communities", href: "/communities", icon: Users },
    { name: "Challenges", href: "/challenges", icon: Target },
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
  }, [router]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showMobileMenu]);

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and main navigation */}
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center"
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowUserMenu(false);
                }}
              >
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-blue-600">Circle</h1>
                </div>
              </Link>

              {/* Desktop navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                ))}

                {/* Create Community Link for authenticated users */}
                {user && (
                  <Link
                    href="/communities/create"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Building2 size={18} />
                    Create Community
                  </Link>
                )}

                {/* Create Challenge Link for authenticated users */}
                {user && (
                  <Link
                    href="/challenges/create"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Create Challenge
                  </Link>
                )}
              </div>
            </div>

            {/* Right side - Auth or User menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notifications */}
                  <button
                    className="text-gray-400 hover:text-gray-600 p-2 touch-manipulation"
                    style={{ minHeight: "44px", minWidth: "44px" }}
                  >
                    <Bell size={20} />
                  </button>

                  {/* User menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2 rounded-md touch-manipulation"
                      style={{ minHeight: "44px" }}
                    >
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || profile.username}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <User size={16} className="text-white" />
                        </div>
                      )}
                      <span className="hidden md:block text-sm font-medium">
                        {profile?.username || "User"}
                      </span>
                    </button>

                    {/* User dropdown menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {profile?.full_name || profile?.username}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {profile?.reputation_points !== undefined && (
                            <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                              <Trophy size={12} />
                              {profile.reputation_points} rep
                            </p>
                          )}
                        </div>

                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 touch-manipulation"
                          style={{ minHeight: "44px" }}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User size={16} className="mr-2" />
                          Profile
                        </Link>

                        <Link
                          href="/communities/create"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden touch-manipulation"
                          style={{ minHeight: "44px" }}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Building2 size={16} className="mr-2" />
                          Create Community
                        </Link>

                        <Link
                          href="/challenges/create"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden touch-manipulation"
                          style={{ minHeight: "44px" }}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Plus size={16} className="mr-2" />
                          Create Challenge
                        </Link>

                        <Link
                          href="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 touch-manipulation"
                          style={{ minHeight: "44px" }}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings size={16} className="mr-2" />
                          Settings
                        </Link>

                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 touch-manipulation"
                          style={{ minHeight: "44px" }}
                        >
                          <LogOut size={16} className="mr-2" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => openAuthModal("login")}
                  >
                    Sign In
                  </Button>
                  <Button onClick={() => openAuthModal("signup")}>
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-400 hover:text-gray-600 touch-manipulation"
                style={{ minHeight: "44px", minWidth: "44px" }}
                aria-label="Toggle mobile menu"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-white"
            ref={mobileMenuRef}
          >
            {/* Header with close button */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-gray-400 hover:text-gray-600 touch-manipulation"
                style={{ minHeight: "44px", minWidth: "44px" }}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation items */}
            <div className="px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-4 py-3 rounded-md text-base font-medium flex items-center gap-3 touch-manipulation"
                  style={{ minHeight: "52px" }}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              ))}

              {user && (
                <>
                  <Link
                    href="/communities/create"
                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-4 py-3 rounded-md text-base font-medium flex items-center gap-3 touch-manipulation"
                    style={{ minHeight: "52px" }}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Building2 size={20} />
                    Create Community
                  </Link>

                  <Link
                    href="/challenges/create"
                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-4 py-3 rounded-md text-base font-medium flex items-center gap-3 touch-manipulation"
                    style={{ minHeight: "52px" }}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Plus size={20} />
                    Create Challenge
                  </Link>

                  <Link
                    href="/profile"
                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-4 py-3 rounded-md text-base font-medium flex items-center gap-3 touch-manipulation"
                    style={{ minHeight: "52px" }}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <User size={20} />
                    Profile
                  </Link>
                </>
              )}

              {!user && (
                <div className="pt-6 space-y-3 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    className="w-full justify-center touch-manipulation"
                    style={{ minHeight: "48px" }}
                    onClick={() => openAuthModal("login")}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full justify-center touch-manipulation"
                    style={{ minHeight: "48px" }}
                    onClick={() => openAuthModal("signup")}
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {user && (
                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSignOut}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full text-left px-4 py-3 rounded-md text-base font-medium flex items-center gap-3 touch-manipulation"
                    style={{ minHeight: "52px" }}
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  );
};

export default Navbar;
