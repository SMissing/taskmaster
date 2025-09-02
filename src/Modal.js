import React, { useRef, useEffect, useState } from 'react';


export default function Modal({ open, onClose, children, bottomDrawer, header }) {
  // Always call hooks at the top level
  const [drawerOpen, setDrawerOpen] = useState(false);
  const modalRef = useRef();

  useEffect(() => {
    if (open && bottomDrawer) {
      requestAnimationFrame(() => setDrawerOpen(true));
    } else {
      setDrawerOpen(false);
    }
  }, [open, bottomDrawer]);

  if (!open) return null;

  if (bottomDrawer) {
    return (
      <div
        style={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1000,
          pointerEvents: open ? 'auto' : 'none',
          background: open ? 'rgba(0,0,0,0.5)' : 'transparent',
          transition: 'background 0.3s',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
        onClick={e => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={modalRef}
          className={`drawer-modal${drawerOpen ? ' open' : ''}`}
          style={{
            background: '#23272a',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            width: '100vw',
            maxWidth: '100vw',
            boxShadow: '0 -4px 32px #000a',
            position: 'relative',
            boxSizing: 'border-box',
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div
            style={{
              position: 'relative',
              left: 0,
              width: '100vw',
              maxWidth: '100%',
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              fontSize: 22,
              fontWeight: 900,
              height: 64,
              background: '#23272a',
              color: '#ffeba7',
              boxShadow: '0 -2px 12px #0008',
              zIndex: 20,
              letterSpacing: 1,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: open ? 1 : 0.8,
              transition: 'opacity 0.3s',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
            }}
          >
            {header || 'Add Task'}
          </div>
          <div
            style={{
              padding: drawerOpen ? '18px 18px 18px 18px' : '0 18px',
              width: '100%',
              maxWidth: 600,
              margin: '0 auto',
              opacity: drawerOpen ? 1 : 0,
              transform: drawerOpen ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 0.35s 0.1s, transform 0.45s cubic-bezier(.4,1.4,.6,1)',
              pointerEvents: drawerOpen ? 'auto' : 'none',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Fallback: regular modal (not bottom drawer)
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
        pointerEvents: open ? 'auto' : 'none',
        background: open ? 'rgba(0,0,0,0.5)' : 'transparent',
        transition: 'background 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#23272a',
          borderRadius: 18,
          minWidth: 320,
          maxWidth: 480,
          width: '90vw',
          boxShadow: '0 4px 32px #000a',
          position: 'relative',
          boxSizing: 'border-box',
          padding: 24,
        }}
        onClick={e => e.stopPropagation()}
      >
        {header && (
          <div
            style={{
              fontWeight: 900,
              fontSize: 22,
              color: '#ffeba7',
              letterSpacing: 1,
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            {header}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
