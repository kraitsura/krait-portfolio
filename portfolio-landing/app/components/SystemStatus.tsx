import React from 'react'

const SystemStatus: React.FC = () => {
  return (
    <div className="fixed top-12 left-12 text-[#d4af37] font-mono text-sm z-40">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>System Operational</span>
      </div>
      <div className="mt-2">
        Last Update: {new Date().toLocaleTimeString()}
      </div>
    </div>
  )
}

export default SystemStatus

