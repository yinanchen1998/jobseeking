import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: '首页' },
    { path: '/browse', label: '浏览工具' },
    { path: '/research', label: '调研报告' },
    { path: '/summary', label: '战略汇总' },
    { path: '/admin', label: '管理' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)]'
          : 'bg-transparent'
      }`}
      style={{ height: isScrolled ? '64px' : '80px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7e43ff] to-[#6527ec] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[5deg]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              JobAI <span className="text-[#7e43ff]">Scout</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium transition-colors duration-300 ${
                  isActive(link.path)
                    ? 'text-[#7e43ff]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-[#7e43ff] transition-all duration-300 ${
                    isActive(link.path) ? 'w-full' : 'w-0 hover:w-full'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/browse">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
            </Link>
            <Link to="/browse">
              <Button
                size="sm"
                className="bg-[#7e43ff] hover:bg-[#6527ec] text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#7e43ff]/25"
              >
                发现工具
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg transition-all duration-300 ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block py-2 text-base font-medium ${
                isActive(link.path)
                  ? 'text-[#7e43ff]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-100">
            <Link to="/browse" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-[#7e43ff] hover:bg-[#6527ec] text-white">
                <Search className="w-4 h-4 mr-2" />
                发现工具
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
