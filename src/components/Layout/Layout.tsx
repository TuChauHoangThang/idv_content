import React from 'react';

import { AmbientBackground } from './AmbientBackground';


export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AmbientBackground />
      <header className="header" style={{ justifyContent: 'center' }}>
        <div className="header-logo blinking-title">CONTENT VÔ HẠN CÙNG IDV</div>
      </header>
      <main className="main-content" style={{ flex: 1 }}>
        {children}
      </main>
      
      <footer className="footer" style={{
        marginTop: 'auto',
        padding: '30px 20px',
        textAlign: 'center',
        background: 'rgba(26, 30, 36, 0.8)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        color: '#a0abbc',
        fontSize: '0.95rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <p style={{ margin: 0, maxWidth: '700px', lineHeight: '1.6' }}>
          Đây là trang web được tạo ra bởi <strong style={{ color: '#e9c46a' }}>Alukachym</strong> để cùng chơi với các ae trong server, hy vọng mọi người có trải nghiệm tuyệt vời với trang web!
        </p>
        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          Nếu có thắc mắc gì xin liên hệ với 
          <a 
            href="https://www.facebook.com/hoang.thang.433675" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              color: '#1877F2', 
              background: '#fff',
              borderRadius: '50%',
              padding: '4px',
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(24, 119, 242, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(24, 119, 242, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(24, 119, 242, 0.3)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
        </p>
      </footer>
    </div>
  );
};
