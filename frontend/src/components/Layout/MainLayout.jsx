import React from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import FloatingTelegramButton from '../UI/FloatingTelegramButton';
import TransactionPinSetupModal from '../TransactionPinSetupModal';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useLocalStorage('sidebarCollapsed', false);

  return (
    <div className="min-h-screen bg-cream dark:bg-primary-900 transition-colors relative">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      <div
        className={`${collapsed ? 'lg:pl-20' : 'lg:pl-72'} flex flex-col min-h-screen transition-all duration-300 pb-28 lg:pb-0`}
      >
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <MobileBottomNav />
      <FloatingTelegramButton />
      {/* First-time transaction PIN setup (database-backed, shown only once) */}
      <TransactionPinSetupModal />
    </div>
  );
};

export default MainLayout;

