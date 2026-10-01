import React from 'react';

export default function Footer() {
  return (
    <footer id="contact" className="relative bg-white pt-12 pb-16 border-t border-gray-100 overflow-hidden">
      {/* Background Car Silhouette on Right Bottom */}
      <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 pointer-events-none hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80"
          alt="Car background"
          className="w-full h-full object-cover object-left"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-xl font-black text-gray-900 mb-8">Contact</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-3xl">
          {/* Column 1: Facilities */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-wider">
              Facilities
            </h3>
            <div className="space-y-3 text-xs text-gray-700">
              <div>
                <p className="font-bold">Olsztyn ul. Bałtycka 64</p>
                <p className="text-gray-500">tel: 533 387 092</p>
              </div>
              <div>
                <p className="font-bold">Kraków ul. Bałtycka 64</p>
                <p className="text-gray-500">tel: 533 387 092</p>
              </div>
              <div>
                <p className="font-bold">Warszawa ul. Bałtycka 64</p>
                <p className="text-gray-500">tel: 533 387 092</p>
              </div>
              <div>
                <p className="font-bold">Gdańsk ul. Bałtycka 64</p>
                <p className="text-gray-500">tel: 533 387 092</p>
              </div>
            </div>
          </div>

          {/* Column 2: Email */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-wider">
              Email
            </h3>
            <div className="space-y-3 text-xs text-gray-700">
              <div>
                <p className="font-bold text-gray-500">Support</p>
                <a href="mailto:support_quickhatch@wp.pl" className="hover:text-amber-500 font-semibold underline">
                  support_quickhatch@wp.pl
                </a>
              </div>
              <div>
                <p className="font-bold text-gray-500">Manager</p>
                <a href="mailto:manager_quickhatch@wp.pl" className="hover:text-amber-500 font-semibold underline">
                  manager_quickhatch@wp.pl
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Socials */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-wider">
              Socials
            </h3>
            <div className="space-y-2.5 text-xs text-gray-800 font-bold">
              {/* Instagram */}
              <a href="#instagram" className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </a>

              {/* Facebook */}
              <a href="#facebook" className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 16 5h2V0h-3.808C10.595 0 9 1.582 9 4.615V8z"/>
                </svg>
                <span>Facebook</span>
              </a>

              {/* Tiktok */}
              <a href="#tiktok" className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
                <span>Tiktok</span>
              </a>

              {/* Linkedin */}
              <a href="#linkedin" className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                </svg>
                <span>Linkedin</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
          <p>© 2026 QuickHatch Rental System. Nhom04 Project.</p>
          <div className="flex gap-4">
            <span className="hover:text-gray-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-600 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
