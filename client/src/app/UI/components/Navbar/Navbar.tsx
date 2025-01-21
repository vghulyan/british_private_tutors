"use client";

import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { UserRole } from "@/state/dataTypes/enums";
import { useLogoutMutation } from "@/state/store/auth/authApi";
import { logOut } from "@/state/store/auth/authSlice";
import { clearMenuItems } from "@/state/store/global";
import { useAppDispatch } from "@/state/store/redux";
import { LogIn, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import MegaMenu from "../MegaMenu/MegaMenu";
import { getNavigationItems } from "./navigationData";

const Navbar = () => {
  const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const { csrfToken, isAuthenticated, role } = useAuth();
  const { profile, isLoading, isSuccess, isError, errorMessage } = useProfile();

  const [menuFlag, setMenuFlag] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle outside-click for user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    // Check if the pathname matches "xyz"
    if (pathname === "/dashboard") {
      console.log("in side dashboard : ", pathname);
      setMenuFlag(true);
    } else {
      console.log("not inside dashboard: ", pathname);
      setMenuFlag(false);
    }
  }, [pathname]); // Re-run the effect when the pathname changes

  const handleLogout = async () => {
    try {
      if (!csrfToken) {
        throw new Error("CSRF token not available.");
      }
      await logoutMutation(csrfToken).unwrap();
      dispatch(logOut());
      dispatch(clearMenuItems());
      router.push("/auth/login");
    } catch (error) {
      // console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <nav className="w-full border-b shadow-sm z-50">
      {/* Container */}
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left section: LOGO + (optional) Sidebar toggle */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* LOGO + BRAND NAME */}
          <div
            onClick={() => router.push("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Image
              src="/logo.png"
              alt={`${process.env.NEXT_PUBLIC_PROJECT_NAME}`}
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
            {/* To hide the name - hidden sm:block */}
            <h1 className="text-lg sm:text-xl font-bold text-red-700 hover:text-red-600 transition-colors">
              {process.env.NEXT_PUBLIC_PROJECT_NAME}
            </h1>
          </div>
        </div>

        <div className="mr-20" />

        {!menuFlag && (
          <ul className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-8">
            <li className="hidden lg:block">
              <Link
                href="/our-schools/about-us/overview"
                className="text-slate-900 text-sm lg:text-base font-extrabold hover:text-indigo-700 transition-all"
              >
                About us
              </Link>
            </li>
            <li className="hidden lg:block">
              <Link
                href="/our-schools/our-schools/overview"
                className="text-slate-900 text-sm lg:text-base font-extrabold hover:text-indigo-700 transition-all"
              >
                Our Schools
              </Link>{" "}
            </li>
            <li className="hidden lg:block">
              <Link
                href="/our-schools/academics/our-curricula"
                className="text-slate-900 text-sm lg:text-base font-extrabold hover:text-indigo-700 transition-all"
              >
                Academics
              </Link>
            </li>
            <li className="hidden lg:block">
              <Link
                href="/our-schools/careers/apply-now"
                className="text-slate-900 text-sm lg:text-base font-extrabold hover:text-indigo-700 transition-all"
              >
                Careers
              </Link>
            </li>
            <li className="hidden lg:block">
              <Link
                href="/our-schools/contact-us/reach-out"
                className="text-slate-900 text-sm lg:text-base font-extrabold hover:text-indigo-700 transition-all"
              >
                Contact
              </Link>
            </li>
          </ul>
        )}

        {isSuccess && (
          // <MegaMenu menuData={getNavigationItems} userRole={role as UserRole} />
          <MegaMenu
            menuData={getNavigationItems}
            userRole={role as UserRole}
            align="center" // or "left", or "center"
          />
        )}

        {/* Right section: Notifications + Profile/Dropdown */}
        <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
          {/* If the user is authenticated, show "Dashboard" and NotificationBell */}

          {/* Profile/Avatar or Login/Register */}
          <div ref={dropdownRef} className="relative">
            {/* If user is logged in, show avatar; else show "Login/Register" */}

            {isError && (
              <div className="flex items-center gap-2">
                {/* Login Button */}
                <button
                  onClick={() => router.push("/auth/login")}
                  className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-200 transition text-sm"
                >
                  {/* Icon for mobile */}
                  <LogIn className="w-4 h-4 text-gray-600 md:hidden" />
                  {/* Text for desktop */}
                  <span className="hidden md:block">Login</span>
                </button>
              </div>
            )}

            {isSuccess && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  disabled={isLogoutLoading}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  {/* Show the icon only on small screens */}
                  <LogOut className="inline-block w-4 h-4 md:hidden" />
                  {/* Show the text only on md and larger screens */}
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
