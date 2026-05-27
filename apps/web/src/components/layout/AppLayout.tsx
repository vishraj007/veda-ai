'use client';

import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';

const layoutStyles: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
};

const mainStyles: React.CSSProperties = {
  flex: 1,
  marginLeft: 'var(--sidebar-width)',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
};

const contentStyles: React.CSSProperties = {
  flex: 1,
  padding: 'var(--space-6)',
  paddingBottom: 'var(--space-8)',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={layoutStyles}>
      <Sidebar />
      <div style={mainStyles} className="main-area">
        <TopBar />
        <main style={contentStyles}>{children}</main>
      </div>
      <MobileNav />
      <style>{`
        @media (max-width: 768px) {
          .main-area {
            margin-left: 0 !important;
            padding-bottom: var(--mobile-nav-height);
          }
        }
      `}</style>
    </div>
  );
}
