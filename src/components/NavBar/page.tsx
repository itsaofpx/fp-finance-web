import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 animate-slideDown">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-xl font-bold text-white animate-fadeIn">
              Finance Pro
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
            >
              ฟีเจอร์
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
            >
              ราคา
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
            >
              เกี่ยวกับเรา
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800 animate-slideDown">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-all duration-300"
              >
                ฟีเจอร์
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-all duration-300"
              >
                ราคา
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-all duration-300"
              >
                เกี่ยวกับเรา
              </a>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default NavBar;
