'use client'

export const BackgroundGrid = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    {/* Deep Blue Background */}
    <div className="absolute inset-0 bg-[#050A18]" />
    
    {/* Grid Pattern */}
    <div 
      className="absolute inset-0 opacity-20" 
      style={{
        backgroundImage: `linear-gradient(to right, #1e3a8a 1px, transparent 1px), linear-gradient(to bottom, #1e3a8a 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
      }} 
    />
    
    {/* Ambient Glows */}
    <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px]" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px]" />
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-purple-600/10 rounded-full blur-[150px]" />
  </div>
)
