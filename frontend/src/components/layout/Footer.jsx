import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-dark-secondary border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white">S</div>
              <span className="font-bold text-xl text-white">Shop<span className="text-primary">Sphere</span></span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Your premium destination for quality products. Shop with confidence — fast delivery, easy returns, and unbeatable prices.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[FiGithub, FiTwitter, FiInstagram, FiMail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary flex items-center justify-center text-slate-400 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/shop', 'Shop'], ['/cart', 'Cart'], ['/orders', 'Orders']].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-slate-400 hover:text-primary text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              {['FAQ', 'Returns', 'Shipping', 'Contact Us', 'Privacy Policy'].map((item) => (
                <li key={item}><a href="#" className="text-slate-400 hover:text-primary text-sm transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/32px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 opacity-50" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/32px-Visa_Inc._logo.svg.png" alt="Visa" className="h-5 opacity-50" />
          </div>
        </div>
      </div>
    </footer>
  );
}
