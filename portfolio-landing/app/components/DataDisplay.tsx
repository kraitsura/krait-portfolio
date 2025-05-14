import React from 'react'

const DataDisplay: React.FC = () => {
  return (
    <div className="fixed bottom-12 left-12 text-[#d4af37] font-mono text-sm z-40">
      <div>System Status: Online</div>
      <div>Connection: Secure</div>
      <div>Bandwidth: 100 Mbps</div>
      <div>Latency: 5ms</div>
    </div>
  )
}

export default DataDisplay

