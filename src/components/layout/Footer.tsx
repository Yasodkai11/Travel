import React from 'react';
export function Footer() {
  return (
    <footer className="bg-primary text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">TravelHarbor Hub</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your one-stop destination for all travel needs. We provide the
              best deals on flights, hotels, and holiday packages to make your
              dream vacation a reality.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-accent">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-sm text-gray-300 mb-2">
              123/A, Colombo
            </p>
            <p className="text-sm text-gray-300 mb-2">
              support@travelharbor.com
            </p>
            <p className="text-sm text-gray-300">011 1234 567</p>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-sm text-gray-400">
          <p>
            Copyright © {new Date().getFullYear()} TravelHarbor Hub. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>);

}