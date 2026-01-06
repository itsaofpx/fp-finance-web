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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { parseCookies, destroyCookie } from "nookies";
import { Avatar, IconButton, Menu, MenuItem, styled } from "@mui/material";

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 12,
    marginTop: 8,
    minWidth: 180,
    backgroundColor: "#111827",
    border: "1px solid #374151",
    color: "#d1d5db",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
    "& .MuiMenuItem-root": {
      fontSize: 14,
      padding: "10px 16px",
      "&:hover": {
        backgroundColor: "#1f2937",
        color: "#ffffff",
      },
    },
  },
}));

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();

  // Anchor สำหรับ Dropdown ต่างๆ
  const [learningAnchor, setLearningAnchor] = useState<null | HTMLElement>(
    null
  );
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const cookies = parseCookies();
    const accessToken = cookies.accessToken;
    setIsLogin(!!accessToken);
  }, []);

  const handleNavigation = (path: string) => {
    setLearningAnchor(null);
    setProfileAnchor(null);
    router.push(path);
  };

  const handleLogout = () => {
    destroyCookie(null, "accessToken");
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation(isLogin ? "/hub" : "/")}
              className="text-xl font-bold text-white hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                F
              </div>
              Finance Pro
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* เมนูศูนย์การเรียนรู้ */}
            <button
              onClick={(e) => setLearningAnchor(e.currentTarget)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                learningAnchor
                  ? "text-white bg-gray-800"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              ศูนย์การเรียนรู้
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  learningAnchor ? "rotate-180" : ""
                }`}
              />
            </button>

            <button
              onClick={() => handleNavigation("/pricing")}
              className="text-gray-300 hover:text-white px-3 py-2"
            >
              ราคา
            </button>

            {isLogin ? (
              <div className="ml-2 flex items-center">
                {/* AI-Powered Avatar Container */}
                <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-emerald-400 animate-gradient-xy">
                  <IconButton
                    onClick={(e) => setProfileAnchor(e.currentTarget)}
                    className="p-0 bg-gray-900 hover:bg-gray-800"
                    size="small"
                  >
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: "#1f2937",
                        fontSize: "0.875rem",
                      }}
                      src="/api/placeholder/32/32"
                    >
                      <User size={20} />
                    </Avatar>
                  </IconButton>

                  {/* AI Badge/Sparkle */}
                  <div className="absolute -top-1 -right-1 bg-gray-900 rounded-full p-0.5 border border-gray-700">
                    <Sparkles size={10} className="text-yellow-400" />
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavigation("/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-all"
              >
                เข้าสู่ระบบ
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* --- Dropdown Menus --- */}

      {/* Learning Menu */}
      <StyledMenu
        anchorEl={learningAnchor}
        open={Boolean(learningAnchor)}
        onClose={() => setLearningAnchor(null)}
      >
        <MenuItem onClick={() => handleNavigation("/glossary")}>
          <BookOpen className="w-4 h-4 mr-3 text-blue-400" /> คำศัพท์ลงทุน
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/tool")}>
          <Wrench className="w-4 h-4 mr-3 text-emerald-400" /> เครื่องมือคำนวณ
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/portfolios")}>
          <Sparkles className="w-4 h-4 mr-3 text-yellow-400" />
          พอร์ตคนดัง
        </MenuItem>
      </StyledMenu>

      {/* Profile Menu */}
      <StyledMenu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <div className="px-4 py-2 mb-1">
          <p className="text-xs text-gray-500">บัญชีผู้ใช้</p>
        </div>
        <MenuItem onClick={() => handleNavigation("/profile")}>
          <User className="w-4 h-4 mr-3 text-gray-400" /> โปรไฟล์
        </MenuItem>
        <MenuItem
          onClick={handleLogout}
          className="text-red-400 hover:text-red-300"
        >
          <LogOut className="w-4 h-4 mr-3" /> ออกจากระบบ
        </MenuItem>
      </StyledMenu>

      {/* Mobile Menu Content */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 p-4 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 px-2 uppercase">
              Menu
            </p>
            <button
              onClick={() => handleNavigation("/glossary")}
              className="block w-full text-left p-2 text-gray-300"
            >
              คำศัพท์ลงทุน
            </button>
            <button
              onClick={() => handleNavigation("/tool")}
              className="block w-full text-left p-2 text-gray-300"
            >
              เครื่องมือคำนวณ
            </button>
            <button
              onClick={() => handleNavigation("/pricing")}
              className="block w-full text-left p-2 text-gray-300"
            >
              ราคา
            </button>
          </div>
          {isLogin && (
            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={() => handleNavigation("/profile")}
                className="block w-full text-left p-2 text-blue-400 font-medium"
              >
                โปรไฟล์ของคุณ (AI Enhanced)
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left p-2 text-red-400"
              >
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
