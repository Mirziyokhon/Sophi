'use client'

export const BackgroundGrid = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-300">
    {/* Background using CSS variable */}
    <div className="absolute inset-0 bg-[var(--background)]" />
    
    {/* Grid Pattern using CSS variable */}
    <div 
      className="absolute inset-0 opacity-10" 
      style={{
        backgroundImage: `linear-gradient(to right, var(--grid-color) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
      }} 
    />
    
    {/* Ambient Glows removed for strict 2-color palette */}
  </div>
)
