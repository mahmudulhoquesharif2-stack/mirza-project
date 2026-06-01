import { useEffect, useState } from 'react';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="nav-shell" style={{ position: 'sticky', top: '18px', zIndex: 50, padding: '0 16px' }}>
      <nav className="nav-dock inline-flex items-center justify-between gap-5 px-6 py-2 rounded-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.13)] shadow-[0_18px_60px_rgba(0,0,0,0.38)] backdrop-blur-[24px]">
        {/* Branding */}
        <Link href="#home" className="brand inline-flex items-center gap-2 text-[var(--mint)] font-bold text-lg tracking-wider">
          <img src="/logo.png" alt="At Taheel Academy logo" className="w-12 h-12 rounded-full" />
          <span>AT TAHEEL</span>
        </Link>

        {/* Language Switcher */}
        <div
          className={`language-switcher notranslate flex items-center gap-1 p-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] backdrop-blur-[18px] transition-all duration-250 ease-out ${
            isScrolled
              ? 'max-w-0 opacity-0 invisible pointer-events-none'
              : 'max-w-[250px] opacity-100 visible'
          }`}
        >
          <LanguageSwitcher />
        </div>

        {/* Navigation links */}
        <ul className="nav-links flex items-center gap-2 list-none m-0 p-0">
          <li>
            <Link href="#course" className="nav-link inline-flex items-center h-10 px-3 rounded-full text-[var(--muted)] text-sm font-bold hover:text-[var(--white)] hover:bg-[rgba(255,255,255,0.06)]">
              কোর্স
            </Link>
          </li>
          <li>
            <Link href="#instructor" className="nav-link inline-flex items-center h-10 px-3 rounded-full text-[var(--muted)] text-sm font-bold hover:text-[var(--white)] hover:bg-[rgba(255,255,255,0.06)]">
              ইন্সট্রাক্টর
            </Link>
          </li>
          <li>
            <Link href="#pricing" className="nav-link inline-flex items-center h-10 px-3 rounded-full text-[var(--muted)] text-sm font-bold hover:text-[var(--white)] hover:bg-[rgba(255,255,255,0.06)]">
              ফি
            </Link>
          </li>
          <li>
            <Link href="#schedule" className="nav-link inline-flex items-center h-10 px-3 rounded-full text-[var(--muted)] text-sm font-bold hover:text-[var(--white)] hover:bg-[rgba(255,255,255,0.06)]">
              শিডিউল
            </Link>
          </li>
          <li>
            <Link href="#payment" className="nav-link inline-flex items-center h-10 px-3 rounded-full text-[var(--muted)] text-sm font-bold hover:text-[var(--white)] hover:bg-[rgba(255,255,255,0.06)]">
              পেমেন্ট
            </Link>
          </li>
        </ul>

        {/* Help link */}
        <Link
          href="https://wa.me/8801310787139"
          target="_blank"
          rel="noopener noreferrer"
          className="help-link inline-flex items-center justify-center h-8 px-3 rounded-full text-[var(--muted)] text-xs font-bold hover:text-[var(--white)] hover:bg-[rgba(255,255,255,0.06)] whitespace-nowrap"
        >
          Help / সাহায্য
        </Link>

        {/* Student profile button – also fades/shrinks on scroll */}
        <Link
          href="/dashboard"
          className={`
            student-profile-button notranslate inline-grid place-items-center w-9 h-9 rounded-full
            text-[var(--text)] font-bold bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)]
            transition-all duration-250 ease-out
            ${isScrolled ? 'max-w-0 opacity-0 invisible pointer-events-none' : 'max-w-9 opacity-100 visible'}
          `}
        >
          +
        </Link>
        {/* CTA button */}
        <Link
          href="#payment"
          className="nav-cta inline-flex items-center justify-center h-10 px-5 rounded-full bg-gradient-to-b from-[var(--mint)] to-[var(--mint-deep)] text-[var(--white)] font-bold hover:shadow-[0_0_28px_var(--mint)]"
        >
          ভর্তি হন
        </Link>
        {/* Mobile menu toggle */}
        <label htmlFor="nav-toggle" className="mobile-menu-button hidden md:inline-flex items-center justify-center w-10 h-10 text-[var(--white)] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-full cursor-pointer">
          ☰
        </label>
      </nav>
    </header>
  );
}
