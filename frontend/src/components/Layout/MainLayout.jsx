import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingTelegramButton from '../UI/FloatingTelegramButton';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-cream dark:bg-primary-900 transition-colors relative">
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <FloatingTelegramButton />
    </div>
  );
};

export default MainLayout;