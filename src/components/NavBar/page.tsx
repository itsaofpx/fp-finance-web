"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseCookies, setCookie, destroyCookie } from "nookies";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const cookies = parseCookies();
    const accessToken = cookies.accessToken;
    setIsLogin(!!accessToken);
  }, []);

  // Function to handle navigation
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            {isLogin ? (
              <button
                onClick={() => handleNavigation("/news")}
                className="text-xl font-bold text-white"
              >
                Finance Pro
              </button>
            ) : (
              <button
                onClick={() => handleNavigation("/")}
                className="text-xl font-bold text-white"
              >
                Finance Pro
              </button>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation("tool")}
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
            >
              เครื่องมือ
            </button>
            <button
              onClick={() => handleNavigation("pricing")}
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
            >
              ราคา
            </button>
            <button
              onClick={() => handleNavigation("about")}
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
            >
              เกี่ยวกับเรา
            </button>
            {isLogin && (
              <button
                onClick={() => handleNavigation("profile")}
                className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
              >
                โปรไฟล์
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => handleNavigation("#features")}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-all duration-300"
              >
                ฟีเจอร์
              </button>
              <button
                onClick={() => handleNavigation("#pricing")}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-all duration-300"
              >
                ราคา
              </button>
              <button
                onClick={() => handleNavigation("#about")}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-all duration-300"
              >
                เกี่ยวกับเรา
              </button>
              {isLogin && (
                <button
                  onClick={() => handleNavigation("/profile")}
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-all duration-300"
                >
                  โปรไฟล์
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
