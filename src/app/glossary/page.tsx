"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, ArrowUpRight, BookText, Hash, Command } from "lucide-react";
import { Modal, Box, IconButton, Fade, Backdrop } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import glossaryData from "./data/glossary";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {
    xs: "94%",
    sm: 680,
    md: 760,
  },
  maxHeight: "90vh",
  overflowY: "auto",
  backgroundColor: "#111827",
  border: "1px solid rgba(75,85,99,0.4)",
  p: {
    xs: 4,
    sm: 5,
    md: 6,
  },
  borderRadius: "24px",
  outline: "none",
  boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
};

const GlossaryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<
    (typeof glossaryData)[0] | null
  >(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    try {
      const regex = new RegExp(searchTerm, "gi");
      return glossaryData.filter((item) => regex.test(item.term)).slice(0, 5);
    } catch {
      return [];
    }
  }, [searchTerm]);

  const filteredData = useMemo(() => {
    return glossaryData
      .filter((item) =>
        item.term.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [searchTerm]);

  const closeModalAndClearSearch = () => {
    setSelectedTerm(null);
    setSearchTerm("");
    setIsSearchFocused(false);
  };

  const groupedData = useMemo(() => {
    const groups: { [key: string]: typeof glossaryData } = {};
    filteredData.forEach((item) => {
      const char = item.term[0].toUpperCase();
      if (!groups[char]) groups[char] = [];
      groups[char].push(item);
    });
    return groups;
  }, [filteredData]);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 selection:bg-gray-600/30">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <header className="mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-100 mb-4">
            Investment Glossary
          </h1>
          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            แหล่งรวมคำศัพท์การลงทุน เข้าใจง่าย เรียบง่าย และใช้งานได้จริง
          </p>
        </header>

        {/* Search */}
        <div className="top-10 z-50 mb-16" ref={searchRef}>
          <div className="relative">
            <Search
              className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isSearchFocused ? "text-gray-200" : "text-gray-500"
              }`}
            />
            <input
              value={searchTerm}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search term (Dividend, ETF...)"
              className="w-full bg-gray-800 border border-gray-700 py-4 pl-14 pr-12 rounded-xl text-white focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-600/20 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}

            <AnimatePresence>
              {isSearchFocused && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg"
                >
                  <div className="p-2">
                    <p className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
                      <Command className="w-3 h-3" /> Suggestions
                    </p>
                    {suggestions.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedTerm(item);
                          setIsSearchFocused(false);
                        }}
                        className="w-full px-3 py-3 text-left rounded-lg hover:bg-gray-700 flex justify-between items-center"
                      >
                        <span className="text-gray-200">{item.term}</span>
                        <ArrowUpRight className="w-4 h-4 text-gray-500" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Alphabet */}
          <div className="mt-6 flex flex-wrap gap-2">
            {alphabet.map((char) => (
              <a
                key={char}
                href={groupedData[char] ? `#section-${char}` : undefined}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold
                  ${
                    groupedData[char]
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 opacity-30 cursor-not-allowed"
                  }`}
              >
                {char}
              </a>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-20">
          {Object.keys(groupedData).length > 0 ? (
            Object.keys(groupedData)
              .sort()
              .map((char) => (
                <section
                  key={char}
                  id={`section-${char}`}
                  className="scroll-mt-48"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-lg font-bold text-gray-200">
                      {char}
                    </span>
                    <div className="h-px flex-grow bg-gray-700" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedData[char].map((item, idx) => (
                      <motion.div
                        key={idx}
                        onClick={() => setSelectedTerm(item)}
                        whileHover={{ scale: 1.02 }}
                        className="p-5 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-750 cursor-pointer transition"
                      >
                        <div className="flex justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-100">
                            {item.term}
                          </h3>
                          <ArrowUpRight className="w-4 h-4 text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {item.definition}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </section>
              ))
          ) : (
            <div className="py-20 text-center">
              <Hash className="w-10 h-10 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-500">ไม่พบคำศัพท์</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={!!selectedTerm}
        onClose={() => closeModalAndClearSearch()}
        closeAfterTransition
      >
        <Fade in={!!selectedTerm}>
          <Box sx={modalStyle}>
            <div className="flex justify-between mb-8">
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <BookText className="w-4 h-4" />
                Insight
              </div>
              <IconButton onClick={() => setSelectedTerm(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </IconButton>
            </div>

            <h2 className="text-3xl font-bold text-white mb-6">
              {selectedTerm?.term}
            </h2>

            <p className="text-gray-300 leading-relaxed">
              {selectedTerm?.definition}
            </p>

            {selectedTerm?.useCase && (
              <div className="mt-8 p-5 rounded-xl bg-gray-800 border border-gray-700">
                <p className="text-sm text-gray-400 italic">
                  {selectedTerm.useCase}
                </p>
              </div>
            )}

            <button
              onClick={() => closeModalAndClearSearch()}
              className="w-full mt-10 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition"
            >
              Close
            </button>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default GlossaryPage;
