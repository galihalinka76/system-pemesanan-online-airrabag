"use client";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [lang, setLang] = useState("EN");
  const [scrolled, setScrolled] = useState(false);

  // Fungsi untuk memantau scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 md:px-12 py-4 flex justify-between items-center ${
        scrolled 
          ? "bg-[#B6AB91]/70 backdrop-blur-lg border-b border-black/10 shadow-md py-3" 
          : "bg-[#B6AB91] backdrop-blur-md border-b border-black/5 py-4"
      }`}
    >
      {/* Brand Logo */}
      <div className="text-2xl font-black tracking-widest text-[#020202]">
        AIRBAG.
      </div>

      {/* Menu Navigation (Desktop) */}
      <div className="hidden md:flex gap-8 text-xs font-bold tracking-widest text-[#020202]/70">
        <a href="#" className="hover:text-[#020202] transition">HOME</a>
        <a href="#" className="hover:text-[#020202] transition">SHOP</a>
        <a href="#" className="hover:text-[#020202] transition">ABOUT</a>
        <a href="#" className="hover:text-[#020202] transition">CONTACT</a>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Language Selector */}
        <div className="relative group mr-2">
          <button className="flex items-center gap-1 text-[10px] font-bold border border-black/20 px-2 py-1 rounded hover:bg-black/5 transition text-[#020202]">
            {lang} ▾
          </button>
          <div className="absolute hidden group-hover:block top-full right-0 bg-white shadow-xl rounded mt-1 overflow-hidden min-w-[60px] z-[60]">
            <button onClick={() => setLang("ID")} className="w-full text-[10px] py-2 px-3 text-black hover:bg-gray-100 text-left">ID</button>
            <button onClick={() => setLang("EN")} className="w-full text-[10px] py-2 px-3 text-black hover:bg-gray-100 text-left">EN</button>
          </div>
        </div>

        {/* Search Icon */}
        <button className="p-2 hover:bg-black/5 rounded-full transition text-[#020202]">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>

        {/* Cart Icon */}
        <button className="p-2 hover:bg-black/5 rounded-full transition relative text-[#020202]">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span className="absolute top-1 right-1 bg-red-600 text-[8px] text-white font-bold px-1 rounded-full min-w-[14px]">2</span>
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-black/10 mx-1 hidden sm:block"></div>

        {/* User / Login Section */}
        <div className="flex items-center gap-3">
          <button className="hidden sm:block text-xs font-bold text-[#020202] hover:underline transition underline-offset-4">
            LOGIN
          </button>
          <button className="bg-[#020202] p-2 rounded-full text-[#B6AB91] hover:scale-110 transition active:scale-95 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </div>

      </div>
    </nav>
  );
}