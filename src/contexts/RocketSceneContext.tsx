'use client';

import React, { createContext, useContext, useState } from 'react';

interface RocketSceneContextType {
  isInRocketScene: boolean;
  setIsInRocketScene: (value: boolean) => void;
}

const RocketSceneContext = createContext<RocketSceneContextType | undefined>(undefined);

export function RocketSceneProvider({ children }: { children: React.ReactNode }) {
  const [isInRocketScene, setIsInRocketScene] = useState(false);

  return (
    <RocketSceneContext.Provider value={{ isInRocketScene, setIsInRocketScene }}>
      {children}
    </RocketSceneContext.Provider>
  );
}

export function useRocketScene() {
  const context = useContext(RocketSceneContext);
  if (context === undefined) {
    throw new Error('useRocketScene must be used within a RocketSceneProvider');
  }
  return context;
}
