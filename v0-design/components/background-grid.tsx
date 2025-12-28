'use client'

export const BackgroundGrid = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-300">
    {/* Background using CSS variable */}
    <div className="absolute inset-0 bg-[var(--background)]" />
    
    {/* Grid Pattern */}
    <div 
      className="absolute inset-0 opacity-[0.03]" 
      style={{
        backgroundImage: `linear-gradient(to right, #F4EEE9 1px, transparent 1px), linear-gradient(to bottom, #F4EEE9 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(circle at center, black 60%, transparent 90%)'
      }} 
    />
    
    {/* Ambient Glows removed for strict 2-color palette */}
  </div>
)
