'use client';

import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashBangContextType {
  triggerFlash: () => Promise<void>;
}

const FlashBangContext = createContext<FlashBangContextType | undefined>(undefined);

export function FlashBangProvider({ children }: { children: React.ReactNode }) {
  const [isFlashing, setIsFlashing] = useState(false);

  const triggerFlash = async () => {
    setIsFlashing(true);

    // Wait for flash duration (400ms)
    await new Promise(resolve => setTimeout(resolve, 400));

    setIsFlashing(false);
  };

  return (
    <FlashBangContext.Provider value={{ triggerFlash }}>
      {children}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white z-[9999] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </FlashBangContext.Provider>
  );
}

export function useFlashBang() {
  const context = useContext(FlashBangContext);
  if (context === undefined) {
    throw new Error('useFlashBang must be used within a FlashBangProvider');
  }
  return context;
}
