import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
interface NavbarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}
export function Navbar({ isLoggedIn, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) =>
  location.pathname === path ?
  'text-accent font-semibold' :
  'text-white hover:text-secondary';
  return (
    <nav className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="text-xl font-bold tracking-wider flex items-center gap-2">

              TravelHarbor Hub
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/packages" className={isActive('/packages')}>
              Packages
            </Link>
            <Link to="/trains" className={isActive('/trains')}>
              Trains
            </Link>
            <Link to="/hotels" className={isActive('/hotels')}>
              Hotels
            </Link>
            <Link to="/places" className={isActive('/places')}>
              Places
            </Link>
            <Link to="/budget-planner" className={isActive('/budget-planner')}>
              Budget Planner
            </Link>
          </div>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ?
            <>
                <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded bg-secondary/20 hover:bg-secondary/30 transition">

                  <User size={18} />
                  <span>Dashboard</span>
                </Link>
                <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded border border-white/30 hover:bg-white/10 transition">

                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </> :

            <>
                <Link
                to="/login"
                className="px-4 py-2 rounded hover:bg-white/10 transition">

                  Sign In
                </Link>
                <Link
                to="/register"
                className="px-4 py-2 rounded bg-accent text-charcoal font-medium hover:bg-accent/90 transition">

                  Register
                </Link>
              </>
            }
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-secondary focus:outline-none">

              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen &&
      <div className="md:hidden bg-primary border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
            to="/packages"
            className="block px-3 py-2 rounded-md hover:bg-white/10"
            onClick={() => setIsOpen(false)}>

              Packages
            </Link>
            <Link
            to="/trains"
            className="block px-3 py-2 rounded-md hover:bg-white/10"
            onClick={() => setIsOpen(false)}>

              Trains
            </Link>
            <Link
            to="/hotels"
            className="block px-3 py-2 rounded-md hover:bg-white/10"
            onClick={() => setIsOpen(false)}>

              Hotels
            </Link>
            <Link
            to="/places"
            className="block px-3 py-2 rounded-md hover:bg-white/10"
            onClick={() => setIsOpen(false)}>

              Places
            </Link>
            <Link
            to="/budget-planner"
            className="block px-3 py-2 rounded-md hover:bg-white/10"
            onClick={() => setIsOpen(false)}>

              Budget Planner
            </Link>

            <div className="border-t border-white/10 my-2 pt-2">
              {isLoggedIn ?
            <>
                  <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md hover:bg-white/10"
                onClick={() => setIsOpen(false)}>

                    Dashboard
                  </Link>
                  <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md hover:bg-white/10">

                    Logout
                  </button>
                </> :

            <>
                  <Link
                to="/login"
                className="block px-3 py-2 rounded-md hover:bg-white/10"
                onClick={() => setIsOpen(false)}>

                    Sign In
                  </Link>
                  <Link
                to="/register"
                className="block px-3 py-2 rounded-md bg-accent text-charcoal font-medium mt-2"
                onClick={() => setIsOpen(false)}>

                    Register
                  </Link>
                </>
            }
            </div>
          </div>
        </div>
      }
    </nav>);

}