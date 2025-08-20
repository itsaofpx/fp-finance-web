"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white">
              Finance Pro
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
            >
              ฟีเจอร์
            </Link>
            <Link
              href="#pricing"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
            >
              ราคา
            </Link>
            <Link
              href="#about"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
            >
              เกี่ยวกับเรา
            </Link>
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
              <Link
                href="#features"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-all duration-300"
              >
                ฟีเจอร์
              </Link>
              <Link
                href="#pricing"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-all duration-300"
              >
                ราคา
              </Link>
              <Link
                href="#about"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-all duration-300"
              >
                เกี่ยวกับเรา
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
