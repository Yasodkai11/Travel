import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
interface LayoutProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  onLogout: () => void;
}
export function Layout({ children, isLoggedIn, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-softwhite font-sans text-charcoal">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>);

}