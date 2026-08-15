import React from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import FloatingTelegramButton from '../UI/FloatingTelegramButton';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-cream dark:bg-primary-900 transition-colors relative">
      <Sidebar />
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <FloatingTelegramButton />
    </div>
  );
};

export default MainLayout;

