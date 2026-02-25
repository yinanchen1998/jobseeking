import { Link } from 'react-router-dom';
import { Sparkles, Mail, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    product: [
      { label: '功能特性', href: '#' },
      { label: '定价方案', href: '#' },
      { label: '集成', href: '#' },
      { label: '更新日志', href: '#' },
    ],
    company: [
      { label: '关于我们', href: '#' },
      { label: '博客', href: '#' },
      { label: '招聘', href: '#' },
      { label: '联系我们', href: '#' },
    ],
    legal: [
      { label: '隐私政策', href: '#' },
      { label: '服务条款', href: '#' },
      { label: 'Cookie 政策', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Mail, href: 'mailto:hello@jobaiscout.com', label: 'Email' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
  ];

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7e43ff] to-[#6527ec] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                JobAI <span className="text-[#7e43ff]">Scout</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              用智能 AI 技术，帮你找到理想工作。每日发现一款求职AI神器，让求职更智能、更高效。
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center transition-all duration-300 hover:bg-[#7e43ff] hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              产品
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-[#7e43ff] transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              公司
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-[#7e43ff] transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              法律
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-[#7e43ff] transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2024 JobAI Scout. 保留所有权利。
          </p>
          <p className="text-gray-500 text-sm">
            Made with ❤️ for job seekers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
