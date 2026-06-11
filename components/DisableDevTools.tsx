'use client';

import { useEffect } from 'react';

export default function DisableDevTools() {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable keyboard shortcuts: Ctrl+U (view source), Ctrl+S (save), Ctrl+A (select all), F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+U - View Source
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
      }
      // F12 - DevTools
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Ctrl+Shift+I - DevTools
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
      }
      // Ctrl+Shift+J - Console
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
      }
      // Ctrl+Shift+C - Inspect Element
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
