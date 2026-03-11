"use client";

import React, { useEffect, useState } from "react";
import {
  Menu as MenuIcon,
  X,
  ChevronDown,
  BookOpen,
  Wrench,
  User,
  LogOut,
  Sparkles,
  Calendar,
  Newspaper,
  CreditCard,
  LayoutDashboard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { parseCookies, destroyCookie } from "nookies";
import { Avatar, IconButton, Menu, MenuItem, styled } from "@mui/material";

const StyledMenu = styled(Menu)(() => ({
  "& .MuiPaper-root": {
    borderRadius: 12,
    marginTop: 8,
    minWidth: 200,
    backgroundColor: "#111827",
    border: "1px solid #374151",
    color: "#d1d5db",
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
    "& .MuiMenuItem-root": {
      fontSize: 14,
      padding: "10px 16px",
      gap: "10px",
      "&:hover": {
        backgroundColor: "#1f2937",
        color: "#ffffff",
      },
    },
  },
}));

const NavBar = () => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const [learningAnchor, setLearningAnchor] =
    useState<null | HTMLElement>(null);

  const [profileAnchor, setProfileAnchor] =
    useState<null | HTMLElement>(null);

  useEffect(() => {
    const cookies = parseCookies();
    setIsLogin(!!cookies.accessToken);
  }, []);

  const handleNavigation = (path: string) => {
    setLearningAnchor(null);
    setProfileAnchor(null);
    setIsOpen(false);
    router.push(path);
  };

  const handleLogin = () => {
    window.location.href =
      "http://localhost:3001/auth/google/login";
  };

  const handleLogout = () => {
    destroyCookie(null, "accessToken");
    sessionStorage.removeItem("hasSeenOnboarding");
    window.location.href = "/";
  };

  const navItems = [
    {
      label: "ข่าว",
      icon: Newspaper,
      path: "/news",
    },
    {
      label: "เรียนรู้",
      icon: BookOpen,
      action: (e: React.MouseEvent<HTMLButtonElement>) =>
        setLearningAnchor(e.currentTarget),
    },
    {
      label: "เครื่องมือ",
      icon: Wrench,
      path: "/tool",
    },
    {
      label: "ราคา",
      icon: CreditCard,
      path: "/pricing",
    },
  ];

  if (isLogin) {
    navItems.splice(3, 0, {
      label: "แผน",
      icon: LayoutDashboard,
      path: "/plan",
    });
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">

      <div className="container mx-auto px-4">

        <div className="relative flex justify-between items-center h-16">

          {/* LEFT — LOGO */}
          <div className="flex">

            <button
              onClick={() =>
                handleNavigation(isLogin ? "/hub" : "/")
              }
              className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-80 transition"
            >
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
                F
              </div>

              Finance Pro
            </button>

          </div>


          {/* CENTER — NAVIGATION */}
          <div className="flex md:flex items-center gap-2">

            {navItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <button
                  key={index}
                  onClick={
                    item.path
                      ? () => handleNavigation(item.path!)
                      : item.action
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200"
                >
                  <Icon size={18} />

                  <span className="text-sm font-medium">
                    {item.label}
                  </span>

                  {item.label === "เรียนรู้" && (
                    <ChevronDown size={14} />
                  )}
                </button>
              );
            })}

          </div>


          {/* RIGHT — PROFILE */}
          <div className="flex items-center gap-3">

            {/* Mobile button */}
            <button
              className="md:hidden text-gray-300"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <MenuIcon />}
            </button>


            {/* Profile */}
            {isLogin ? (
              <div className="relative hidden md:block">

                <div className="p-[2px] rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-emerald-400">

                  <IconButton
                    onClick={(e) =>
                      setProfileAnchor(e.currentTarget)
                    }
                    className="p-0 bg-gray-900 hover:bg-gray-800"
                  >
                    <Avatar
                      sx={{
                        width: 26,
                        height: 26,
                        bgcolor: "#1f2937",
                      }}
                    >
                      <User size={20} />
                    </Avatar>
                  </IconButton>

                </div>

                <div className="absolute -top-1 -right-1 bg-gray-900 rounded-full p-0.5 border border-gray-700">
                  <Sparkles
                    size={10}
                    className="text-yellow-400"
                  />
                </div>

              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition"
              >
                เข้าสู่ระบบ
              </button>
            )}

          </div>

        </div>

      </div>


      {/* LEARNING DROPDOWN */}
      <StyledMenu
        anchorEl={learningAnchor}
        open={Boolean(learningAnchor)}
        onClose={() => setLearningAnchor(null)}
      >

        <MenuItem
          onClick={() => handleNavigation("/glossary")}
        >
          <BookOpen size={16} />
          คำศัพท์ลงทุน
        </MenuItem>

        <MenuItem
          onClick={() => handleNavigation("/portfolios")}
        >
          <Sparkles size={16} />
          พอร์ตคนดัง
        </MenuItem>

      </StyledMenu>


      {/* PROFILE DROPDOWN */}
      <StyledMenu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >

        <MenuItem
          onClick={() => handleNavigation("/profile")}
        >
          <User size={16} />
          โปรไฟล์
        </MenuItem>

        <MenuItem
          onClick={handleLogout}
          className="text-red-400"
        >
          <LogOut size={16} />
          ออกจากระบบ
        </MenuItem>

      </StyledMenu>


      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 p-4 space-y-2">

          {navItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={index}
                onClick={
                  item.path
                    ? () => handleNavigation(item.path!)
                    : undefined
                }
                className="flex items-center gap-3 w-full p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded"
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}

          {isLogin && (
            <>
              <button
                onClick={() =>
                  handleNavigation("/profile")
                }
                className="flex items-center gap-3 w-full p-2 text-gray-300 hover:text-white"
              >
                <User size={18} />
                โปรไฟล์
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-2 text-red-400"
              >
                <LogOut size={18} />
                ออกจากระบบ
              </button>
            </>
          )}

        </div>
      )}

    </nav>
  );
};

export default NavBar;