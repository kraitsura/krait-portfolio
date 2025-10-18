'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TouchContextType {
  isTouchDevice: boolean;
}

const TouchContext = createContext<TouchContextType | undefined>(undefined);

export function TouchProvider({ children }: { children: React.ReactNode }) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if device has coarse pointer (touch)
    const hasTouchCapability = window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(hasTouchCapability);
  }, []);

  return (
    <TouchContext.Provider value={{ isTouchDevice }}>
      {children}
    </TouchContext.Provider>
  );
}

export function useTouchDevice() {
  const context = useContext(TouchContext);
  if (context === undefined) {
    throw new Error('useTouchDevice must be used within a TouchProvider');
  }
  return context;
}
