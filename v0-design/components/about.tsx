'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Users, 
  Map, 
  Lightbulb, 
  BarChart3, 
  Briefcase, 
  Trophy,
  Shield,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { BackgroundGrid } from './background-grid';
import { Footer } from './footer';

// Using standard function component instead of named export for single-file environment convenience
export default function About() { 
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [showProblemDetails, setShowProblemDetails] = useState(false);
  const [showTechStack, setShowTechStack] = useState(false);
  const [showAIStrategy, setShowAIStrategy] = useState(false);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  // const [isSpinning, setIsSpinning] = useState(false) // Removed as it wasn't used
  const containerRef = useRef<HTMLDivElement>(null);

  const SECTIONS = [
    { id: 'problem', label: 'Problem', icon: Target },
    { id: 'solution', label: 'Solution', icon: Lightbulb },
    { id: 'market', label: 'Market', icon: BarChart3 },
    { id: 'business', label: 'Business Model', icon: Briefcase },
    { id: 'competitors', label: 'Competitors', icon: Trophy },
    { id: 'moat', label: 'Moat', icon: Shield },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'roadmap', label: 'Roadmap', icon: Map }
  ];

  const ITEM_WIDTH = 140;
  const GAP = 20;

  // Handle responsive centering
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        const newIndex = activeIndex === 0 ? SECTIONS.length - 1 : activeIndex - 1;
        setActiveIndex(newIndex);
      } else if (e.key === 'ArrowRight') {
        const newIndex = (activeIndex + 1) % SECTIONS.length;
        setActiveIndex(newIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, SECTIONS.length]);

  // Handle direct tab click
  const handleItemClick = (index: number) => {
    setActiveIndex(index);
  };

  /**
   * FIX #1: Correct Translation Calculation
   * Calculation: Shift the track left by the difference between the center of the container
   * and the center of the active item's position on the track.
   * This ensures the active item is always perfectly centered.
   */
  const centerOfContainer = containerWidth / 2;
  const centerOfActiveItem = (activeIndex * (ITEM_WIDTH + GAP)) + (ITEM_WIDTH / 2);
  const translateX = centerOfContainer - centerOfActiveItem;

  const teamMembers = [
    {
      name: "Mirziyo Muhammadiyev",
      role: "Product Manager  Team Lead",
      role_description: "Focuses on building clear product goals, leading the team while sharing the technical tasks, and pitching the product to the audience.",
      skills: ["Web Development", "JS", "PHP", "Python", "Figma", "Node.js", "WordPress", "Product Management"],
      stack: ["Gap Year · Plans to pursue Cognitive Science in top universities", "Great Debater (EdTech Product) CPO", "AI Consciousness Researcher"],
      link: "https://www.linkedin.com/in/mirziyo-muhammadiyev-a1170626b",
      image: "/mirziyo.jpg"
    },
    {
      name: "Shakhzod Sultonov",
      role: "Data Engineer",
      role_description: "Builds data pipelines and processes structured information for machine learning models",
      skills: ["Python", "SQL", "Data Analytics", "ETL Pipelines"],
      stack: ["Economics & Data Analytics Track · TSUE", "Academic and research projects in analytics"],
      image: "/shokhzod1.jpg"
    },
    {
      name: "Atabek Nizamatdinov",
      role: "Designer",
      role_description: "Creates UI/UX designs and visual systems",
      skills: ["Figma", "UI/UX Prototyping", "Graphic Design", "Branding Systems"],
      stack: ["Gap Year · Plans to pursue Applied Mathematics in top universities", "Collaboration and design activities at Makon AI", "Seasoned educator at SAT Makon"],
      image: "/atashbek.jpg"
    },
    {
      name: "Umarbek Xaitov",
      role: "Full-Stack Developer",
      role_description: "Develops the frontend and backend of the web application and integrates AI models, pipelines, and APIs",
      skills: ["Web Development", "JavaScript", "PHP", "Python", "Node.js", "C++"],
      stack: ["AI & Robotics · New Uzbekistan University", "Freelance development and web technology practice", "IELTS Zone"],
      link: "https://www.linkedin.com/in/umarbek-khaitov-855737317/",
      image: "/topasbek.jpg"
    },
    {
      name: "Umarjon Tashmukhamedov",
      role: "ML Engineer",
      role_description: "Builds machine learning models and NLP systems",
      skills: ["Machine Learning", "NLP", "Python", "Model Training", "C++"],
      stack: ["AI & Robotics · New Uzbekistan University", "AI-focused academic research & ML experimentation", "SATashkent"],
      link: "https://www.linkedin.com/in/umarkin/",
      image: "/umarkin.jpg"
    }
  ]

  const renderContent = () => {
    const activeSection = SECTIONS[activeIndex]
    
    switch (activeSection.id) {
      case 'problem':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-white/10">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                The Time Problem in Education
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Students waste 4-6 hours daily on dense textbooks they don't understand.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Teachers assign 2-hour lecture recordings students never watch.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  The bottleneck: Creating engaging 3-minute animated explanations costs $500-2000 per video.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Bottom line: Students burn 6 hours on textbooks. Teachers spend weeks on one video. Creators can't scale. Time is the real cost. Everyone loses.
                </p>
              </div>
              
              {/* Toggle Section */}
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl p-6 border border-white/10 mt-6">
                <button 
                  onClick={() => setShowProblemDetails(!showProblemDetails)}
                  className="w-full text-left group"
                >
                  <h3 className="text-lg font-semibold text-gray-300 group-hover:text-white transition-colors">
                    Is this problem acute?
                  </h3>
                </button>
                
                <AnimatePresence>
                  {showProblemDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 space-y-4"
                    >
                      <div className="space-y-4 text-gray-300">
                        <p className="leading-relaxed">
                          <strong>Students:</strong> 4-6 hours daily grinding through textbooks they don't understand. That's 20-30 hours per week. 1,200+ hours per year per student.
                        </p>
                        <p className="leading-relaxed">
                          <strong>Teachers:</strong> Weeks to create one quality animated lesson. Most give up. Default to lecturing or assigning readings instead.
                        </p>
                        <p className="leading-relaxed">
                          <strong>Content creators:</strong> Can't scale past 1-2 videos per week with current tools. Growth bottlenecked by production time.
                        </p>
                        <p className="leading-relaxed font-semibold text-orange-400">
                          This isn't occasional pain. It's chronic bleeding.
                        </p>
                        <p className="leading-relaxed">
                          Every day a student wastes on a confusing textbook.
                          Every week a teacher doesn't create engaging content because it takes too long.
                          Every month a creator can't grow because production is the bottleneck.
                        </p>
                        <p className="leading-relaxed font-semibold">
                          Compound the numbers:
                        </p>
                        <p className="leading-relaxed">
                          10M college students × 25 wasted hours/week = 250M hours burned weekly on inefficient learning.
                        </p>
                        <p className="leading-relaxed font-bold text-lg text-red-400">
                          That's the market pain.
                          Daily. Relentless. Everywhere.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )

      case 'team':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Meet Our Team
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                The perfect blend of educators, engineers, and designers passionate about transforming learning
              </p>
            </div>

            {/* Compact team member row */}
            <div className="flex flex-nowrap justify-center gap-6 md:gap-10 lg:gap-14 overflow-visible pb-8 w-full">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedMember(selectedMember === index ? null : index)}
                  className={`profile-card flex flex-col items-center w-32 text-center group cursor-pointer flex-shrink-0 relative ${
                    selectedMember === index 
                      ? 'scale-105 opacity-100' 
                      : 'scale-100 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="relative w-24 h-24 mb-4">
                    {/* Outer Ring */}
                    <div className="profile-ring absolute inset-0 rounded-full w-full h-full bg-purple-500/20 border border-purple-500/30 transition-all duration-300 group-hover:scale-105 group-hover:bg-purple-500/30 group-hover:border-purple-500/50"></div>
                    {/* Image */}
                    {member.image.includes('.') && !member.image.includes('👨') && !member.image.includes('👩') && !member.image.includes('🎨') && !member.image.includes('💻') && !member.image.includes('🤖') ? (
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="absolute inset-2 w-20 h-20 rounded-full object-cover border-2 border-slate-700/50"
                      />
                    ) : (
                      <div className="absolute inset-2 w-20 h-20 rounded-full flex items-center justify-center text-5xl bg-slate-800/50 border-2 border-slate-700/50">{member.image}</div>
                    )}
                  </div>
                  <h3 className="role-text text-sm font-medium tracking-wide text-cyan-400">{member.role}</h3>
                </motion.div>
              ))}
            </div>

            {/* Expanded member details */}
            <AnimatePresence>
              {selectedMember !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-2xl p-8"
                >
                  <div className="flex items-start gap-6 mb-6">
                    <div className="flex-shrink-0">
                      {teamMembers[selectedMember].image.includes('.') && !teamMembers[selectedMember].image.includes('👨') && !teamMembers[selectedMember].image.includes('👩') && !teamMembers[selectedMember].image.includes('🎨') && !teamMembers[selectedMember].image.includes('💻') && !teamMembers[selectedMember].image.includes('🤖') ? (
                        <img 
                          src={teamMembers[selectedMember].image} 
                          alt={teamMembers[selectedMember].name}
                          className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
                        />
                      ) : (
                        <div className="text-6xl">{teamMembers[selectedMember].image}</div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-2xl mb-2">{teamMembers[selectedMember].name}</h3>
                      <p className="text-primary font-medium mb-4">{teamMembers[selectedMember].role}</p>
                      {teamMembers[selectedMember].link && (
                        <a 
                          href={teamMembers[selectedMember].link}
                          className="text-primary hover:text-blue-400/80 text-sm font-medium flex items-center gap-1 mb-4"
                        >
                          LinkedIn →
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Role</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-3 py-2 bg-purple-500/10 text-purple-400 text-xs rounded-lg font-medium">
                          {teamMembers[selectedMember].role_description}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {teamMembers[selectedMember].skills.map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Background</p>
                      <div className="flex flex-wrap gap-1">
                        {teamMembers[selectedMember].stack.map((tech) => (
                          <span key={tech} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-white/10">
              <p className="text-xl text-gray-300 leading-relaxed text-center max-w-4xl mx-auto font-medium">
                We were both learners and the educators, we have lived the problem, we love the mission, and we have the skills to deliver. That's why we are not just <span className="text-accent font-bold">a</span> team<br/>
                we are <span className="text-primary font-bold">the team</span>.
              </p>
            </div>
          </motion.div>
        )

      case 'roadmap':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Development Roadmap
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Current Stage: MVP
              </p>
            </div>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary to-accent"></div>
              
              {/* Current Status: MVP */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="relative flex items-center mb-12"
              >
                <div className="w-5/12 pr-8 text-right">
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-green-500">Current Stage: MVP</h3>
                      <p className="text-sm text-gray-400">Working Product</p>
                    </div>
                    <p className="text-gray-300 text-sm text-center mb-4">
                      Working product with proven core loop: content extraction → AI script generation → personalized sketch animation with subtitles.
                    </p>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowTechStack(!showTechStack)}
                        className="w-full bg-green-500/10 rounded-lg p-3 text-left group hover:bg-green-500/20 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 font-semibold text-sm">🔧 Technical Stack</span>
                          <span className={`text-green-400 text-xs transition-transform ${showTechStack ? 'rotate-180' : ''}`}>▼</span>
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {showTechStack && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-green-500/5 rounded-lg p-3 space-y-2"
                          >
                            <div className="text-center space-y-4">
                              <div>
                                <span className="text-green-400 font-semibold">Frontend:</span>
                                <p className="text-gray-400 mt-1">Next.js + TypeScript • Tailwind CSS • Radix UI • Recharts</p>
                              </div>
                              <div>
                                <span className="text-green-400 font-semibold">Backend:</span>
                                <p className="text-gray-400 mt-1">FastAPI (Python) • PostgreSQL • Redis (job queues)</p>
                              </div>
                              <div>
                                <span className="text-green-400 font-semibold">AI Services:</span>
                                <p className="text-gray-400 mt-1">Gemini • Replicate • LangChain</p>
                              </div>
                              <div>
                                <span className="text-green-400 font-semibold">Infrastructure:</span>
                                <p className="text-gray-400 mt-1">Vercel (frontend) • AWS S3 (storage) • Web Scraping</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-background border-4 border-green-500 rounded-full z-10"></div>
              </motion.div>

              {/* Next 30 Days */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative flex items-center mb-12"
              >
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-background border-4 border-blue-500 rounded-full z-10"></div>
                <div className="w-5/12 pl-8 ml-auto">
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-blue-500">Next Steps</h3>
                      <p className="text-sm text-gray-400">Product Enhancement</p>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-500/10 rounded-lg p-3">
                          <h4 className="text-blue-400 font-semibold text-sm mb-2">🎙️ Audio Integration</h4>
                          <ul className="text-gray-300 text-xs space-y-1">
                            <li>• ElevenLabs voiceover API</li>
                            <li>• Audio-video sync pipeline</li>
                            <li>• 3+ voice style options</li>
                          </ul>
                        </div>
                        <div className="bg-purple-500/10 rounded-lg p-3">
                          <h4 className="text-purple-400 font-semibold text-sm mb-2">⚡ Performance</h4>
                          <ul className="text-gray-300 text-xs space-y-1">
                            <li>• Generation time under 60 seconds</li>
                            <li>• Async job processing with Redis</li>
                            <li>• Error recovery for failed renders</li>
                          </ul>
                        </div>
                        <div className="bg-orange-500/10 rounded-lg p-3">
                          <h4 className="text-orange-400 font-semibold text-sm mb-2">🔧 Backend Migration</h4>
                          <ul className="text-gray-300 text-xs space-y-1">
                            <li>• Migrate Streamlit to FastAPI</li>
                            <li>• Unify API endpoints</li>
                            <li>• Improve response times</li>
                          </ul>
                        </div>
                        <div className="bg-green-500/10 rounded-lg p-3">
                          <h4 className="text-green-400 font-semibold text-sm mb-2">📊 Market Validation</h4>
                          <ul className="text-gray-300 text-xs space-y-1">
                            <li>• Beta tester feedback</li>
                            <li>• User behavior analysis</li>
                            <li>• Feature usage metrics</li>
                          </ul>
                        </div>
                      </div>
                      <div className="bg-red-500/10 rounded-lg p-3 text-center">
                        <h4 className="text-red-400 font-semibold text-sm mb-2">🎥 Video Features</h4>
                        <ul className="text-gray-300 text-xs space-y-1">
                          <li>• Video lecture to animation</li>
                          <li>• Multi-format support</li>
                          <li>• Batch processing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Q1 2026: Scale Foundation */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative flex items-center mb-12"
              >
                <div className="w-5/12 pr-8 text-right">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-purple-500">Q1 2026</h3>
                      <p className="text-sm text-gray-400">Scale Foundation</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-purple-500/10 rounded-lg p-3 text-center">
                        <h4 className="text-purple-400 font-semibold text-sm mb-2">💰 Monetization</h4>
                        <ul className="text-gray-300 space-y-1">
                          <li>• Stripe payment system</li>
                          <li>• Tiered access control</li>
                          <li>• Usage tracking</li>
                        </ul>
                      </div>
                      <div className="bg-green-500/10 rounded-lg p-3 text-center">
                        <h4 className="text-green-400 font-semibold text-sm mb-2">🚀 Scale Foundation</h4>
                        <ul className="text-gray-300 space-y-1">
                          <li>• Video generation caching</li>
                          <li>• Proprietary training dataset</li>
                          <li>• Cost optimization to $0.007/min</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-center gap-2">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">💰 Monetize</span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">🚀 Scale</span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">💡 Optimize</span>
                    </div>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-background border-4 border-purple-500 rounded-full z-10"></div>
              </motion.div>

              {/* AI Strategy */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative flex items-center"
              >
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-background border-4 border-orange-500 rounded-full z-10"></div>
                <div className="w-5/12 pl-8 ml-auto">
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-orange-500">AI Strategy</h3>
                      <p className="text-sm text-gray-400">Long-term Vision</p>
                    </div>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowAIStrategy(!showAIStrategy)}
                        className="w-full bg-orange-500/10 rounded-lg p-3 text-left group hover:bg-orange-500/20 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-orange-400 font-semibold text-sm">🤖 AI Strategy Details</span>
                          <span className={`text-orange-400 text-xs transition-transform ${showAIStrategy ? 'rotate-180' : ''}`}>▼</span>
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {showAIStrategy && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-orange-500/5 rounded-lg p-3 space-y-2"
                          >
                            <div className="space-y-3">
                              <div className="bg-orange-500/10 rounded-lg p-3">
                                <h4 className="text-orange-400 font-semibold text-sm mb-2">🧠 Model Development</h4>
                                <p className="text-gray-300 text-xs mb-2">Building our proprietary AI model from scratch</p>
                                <div className="text-xs text-gray-400 space-y-1">
                                  <p>• Custom architecture for educational content</p>
                                  <p>• Specialized training on learning materials</p>
                                  <p>• Optimized for sketch animation generation</p>
                                </div>
                              </div>
                              <div className="bg-red-500/10 rounded-lg p-3">
                                <h4 className="text-red-400 font-semibold text-sm mb-2">� Training Pipeline</h4>
                                <p className="text-gray-300 text-xs mb-2">End-to-end model training infrastructure</p>
                                <div className="text-xs text-gray-400 space-y-1">
                                  <p>• Proprietary dataset collection</p>
                                  <p>• Custom fine-tuning workflows</p>
                                  <p>• Continuous learning from user feedback</p>
                                </div>
                              </div>
                              <div className="bg-yellow-500/10 rounded-lg p-3">
                                <h4 className="text-yellow-400 font-semibold text-sm mb-2">� Model Optimization</h4>
                                <p className="text-gray-300 text-xs mb-2">Performance and efficiency improvements</p>
                                <div className="text-xs text-gray-400 space-y-1">
                                  <p>• Inference speed optimization</p>
                                  <p>• Cost reduction per generation</p>
                                  <p>• Quality and consistency improvements</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )

      case 'solution':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-white/10">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                We're solving the time problem in education.
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  We turn any textbook or lecture into a short sketch animation.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Animations teach through your interest. Love football? It teaches integrals with football analogues.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Students learn in minutes instead of hours.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Teachers and creators make content in seconds instead of weeks.
                </p>
                <p className="text-gray-300 text-xl font-semibold text-center mt-8">
                  That's it.
                </p>
              </div>
            </div>
          </motion.div>
        )

      case 'market':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Market Opportunity
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 border border-primary/20">
                <h3 className="text-2xl font-bold mb-6 text-primary">📈 Market Size</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Global EdTech Market</span>
                    <span className="font-bold text-xl">$404B</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Digital Learning</span>
                    <span className="font-bold text-xl">$125B</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Video Content Creation</span>
                    <span className="font-bold text-xl">$61B</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Annual Growth Rate</span>
                    <span className="font-bold text-xl text-green-500">+18%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-3xl p-8 border border-accent/20">
                <h3 className="text-2xl font-bold mb-6 text-accent">🎯 Target Segments</h3>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-purple-500">1. Individuals</h4>
                        <p className="text-sm text-gray-400">Students, learners, tutors, content creators</p>
                      </div>
                      <span className="text-xs text-purple-500 bg-purple-500/20 px-2 py-1 rounded-full">Volume & Virality</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-green-500">2. Enterprises</h4>
                        <p className="text-sm text-gray-400">Learning centers, institutions, other businesses</p>
                      </div>
                      <span className="text-xs text-green-500 bg-green-500/20 px-2 py-1 rounded-full">Highest LTV</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-white/10 flex items-center justify-center">
              <p className="text-2xl text-primary font-bold leading-relaxed text-center">
                "2% of EdTech video market is currently animated. At our price point, that number goes to 40%. 
                We're not entering a market. We're creating one."
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl p-6 border border-white/10">
              <h3 className="text-lg font-bold mb-4 text-gray-300">References</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <a href="https://www.holoniq.com/notes/global-education-technology-market-to-reach-404b-by-2025?utm_source=chatgpt.com" 
                     target="_blank" rel="noopener noreferrer" 
                     className="text-gray-400 hover:text-primary transition-colors">
                    Global Education Technology Market - HoloniQ
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <a href="https://www.grandviewresearch.com/industry-analysis/digital-education-market-report" 
                     target="_blank" rel="noopener noreferrer" 
                     className="text-gray-400 hover:text-primary transition-colors">
                    Digital Education Market - Grand View Research
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <a href="https://www.grandviewresearch.com/press-release/global-digital-content-creation-market" 
                     target="_blank" rel="noopener noreferrer" 
                     className="text-gray-400 hover:text-primary transition-colors">
                    Digital Content Creation Market - Grand View Research
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'business':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Business Model
              </h2>
              <p className="text-lg text-gray-400">Pricing tiers and unit economics</p>
            </div>

            {/* Pricing Tiers */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-6 text-primary">Pricing Tiers</h3>
                <p className="text-gray-400 mb-6">We use a freemium model to drive adoption and conversion</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <h4 className="font-bold text-green-400 mb-2">Free</h4>
                    <p className="text-sm text-gray-400 mb-3">50 minutes/month</p>
                    <span className="font-bold text-green-400 text-lg">$0</span>
                  </div>
                  <div className="bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <h4 className="font-bold text-primary mb-2">Pro</h4>
                    <p className="text-sm text-gray-400 mb-3">200 minutes/month</p>
                    <span className="font-bold text-primary text-lg">$9.99/mo</span>
                  </div>
                  <div className="bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <h4 className="font-bold text-accent mb-2">Advanced</h4>
                    <p className="text-sm text-gray-400 mb-3">500 minutes/month</p>
                    <span className="font-bold text-accent text-lg">$19.99/mo</span>
                  </div>
                  <div className="bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <h4 className="font-bold text-purple-400 mb-2">Enterprise</h4>
                    <p className="text-sm text-gray-400 mb-3">Custom features + API</p>
                    <span className="font-bold text-purple-400 text-lg">Custom</span>
                  </div>
                </div>
              </div>

            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl p-8 border border-green-500/20 mb-12">
              <h3 className="text-2xl font-bold mb-6 text-green-500">The Simple Math</h3>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8 text-center">
                <div className="bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h4 className="font-bold text-2xl mb-2 text-green-400">Cost</h4>
                  <p className="text-3xl font-bold text-green-500 mb-2">$0.01</p>
                  <p className="text-sm text-gray-400">to make 1 minute</p>
                </div>
                
                <div className="bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h4 className="font-bold text-2xl mb-2 text-green-400">Price</h4>
                  <p className="text-3xl font-bold text-green-500 mb-2">$0.15</p>
                  <p className="text-sm text-gray-400">we charge per minute</p>
                </div>
                
                <div className="bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h4 className="font-bold text-2xl mb-2 text-green-400">Profit</h4>
                  <p className="text-3xl font-bold text-green-500 mb-2">$0.14</p>
                  <p className="text-sm text-gray-400">per minute</p>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <button 
                  onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                  className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {showCostBreakdown ? 'Hide' : 'Show'} Cost Breakdown
                </button>
              </div>
              
              <AnimatePresence>
                {showCostBreakdown && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-xl p-6 mb-8"
                  >
                    <h4 className="font-bold text-lg mb-4 text-green-400">How We Make It For $0.01</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">AI text-to-animation</span>
                        <span className="font-bold">$0.005</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sketch rendering + transitions</span>
                        <span className="font-bold">$0.003</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Voiceover AI</span>
                        <span className="font-bold">$0.002</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Storage + bandwidth</span>
                        <span className="font-bold">$0.001</span>
                      </div>
                      <div className="border-t border-green-500/30 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold text-green-400">Total</span>
                          <span className="font-bold text-green-500">$0.01</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-xl p-6">
                <h4 className="font-bold text-lg mb-4 text-green-400">Path to Profit</h4>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Right Now</p>
                    <p className="font-bold text-2xl text-red-500">-$15K/mo</p>
                    <p className="text-xs text-gray-500">building the product</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">1,000 Users</p>
                    <p className="font-bold text-2xl text-yellow-500">-$5K/mo</p>
                    <p className="text-xs text-gray-500">almost there</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">3,000 Users</p>
                    <p className="font-bold text-2xl text-green-500">+$25K/mo</p>
                    <p className="text-xs text-gray-500">profitable</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'competitors':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Competitive Landscape
              </h2>
            </div>

            {/* The Competition */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-6 text-primary">The Competition</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Traditional Tools */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-red-400">Traditional Tools</h4>
                  <p className="text-sm text-gray-400 mb-4">(Synthesia, Descript, Lumen5, Pictory)</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-300">Generic video creation</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-300">Manual scripting required</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-300">Not built for education</p>
                    </div>
                  </div>
                </div>

                {/* Our Approach */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-green-500">Our Approach</h4>
                  <p className="text-sm text-gray-400 mb-4">(Creating a new category)</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-300">PDF/webpage → animated lesson in 2 clicks</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-300">Sketch-style optimized for learning retention</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-300">Personalized to student interests automatically</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-lg font-semibold text-green-500 text-center">
                  We're not competing with video tools. We're replacing textbook publishers.
                </p>
              </div>
            </div>

            </motion.div>
        )

      case 'moat':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Our Competitive Moat
              </h2>
            </div>

            {/* The Thesis */}
            <div className="bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-2xl p-8">
              <p className="text-lg text-gray-300 leading-relaxed text-center">
                Everyone is building photorealistic AI videos.<br/>
                <span className="text-white font-semibold">We're building the AI sketch animations.</span><br/>
                Different training data. Different models. Different market.<br/>
                <span className="text-gray-200 font-medium">And we will be years ahead of others.</span>
              </p>
            </div>

            {/* Competitive Advantage Timeline */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-2 text-center text-primary">Technology Moat</h3>
              <p className="text-gray-400 text-center mb-6">The foundation of our 10-year advantage</p>
              <div className="relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary transform -translate-x-1/2"></div>
                <div className="space-y-8">
                  <div className="flex items-center">
                    <div className="flex-1 text-right pr-8">
                      <h4 className="font-semibold text-primary">Year 1-2: Exclusive Market</h4>
                      <p className="text-sm text-gray-400">Only sketch animation AI for education</p>
                    </div>
                    <div className="w-4 h-4 bg-primary rounded-full border-4 border-[#050A18] z-10"></div>
                    <div className="flex-1 pl-8">
                      <p className="text-sm text-gray-300">Competitors focused on photorealism</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1 text-right pr-8">
                      <p className="text-sm text-gray-300">Data advantage compounds</p>
                    </div>
                    <div className="w-4 h-4 bg-accent rounded-full border-4 border-[#050A18] z-10"></div>
                    <div className="flex-1 pl-8">
                      <h4 className="font-semibold text-accent">Year 3-5: Data Network Effects</h4>
                      <p className="text-sm text-gray-400">Every user improves the models</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1 text-right pr-8">
                      <h4 className="font-semibold text-green-400">Year 6-10: Category Dominance</h4>
                      <p className="text-sm text-gray-400">Educational content standard</p>
                    </div>
                    <div className="w-4 h-4 bg-green-400 rounded-full border-4 border-[#050A18] z-10"></div>
                    <div className="flex-1 pl-8">
                      <p className="text-sm text-gray-300">Impossible to catch up</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#050A18] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative flex flex-col">
      <BackgroundGrid />
      <div className="relative z-10 flex flex-col flex-grow">
        <div className="flex-grow pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            About Sophi
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Transforming education through AI-powered personalized learning experiences
          </p>
        </motion.div>

        {/* --- ROULETTE COMPONENT --- */}
        <div className="relative w-full py-12 flex flex-col items-center justify-center">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />

          <div 
            ref={containerRef}
            className="w-full max-w-4xl relative h-48 overflow-hidden"
          >
            <motion.div 
              className="absolute top-0 left-0 h-full flex items-center will-change-transform"
              animate={{
                x: translateX,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 25 }}
            >
              {SECTIONS.map((section, index) => {
                const isActive = index === activeIndex;
                const distance = Math.abs(activeIndex - index);
                
                let scale, opacity, blur, zIndex;

                if (distance === 0) {
                    scale = 1.15;
                    opacity = 1.0;
                    blur = 0;
                    zIndex = 100;
                } else {
                    scale = Math.max(0.7, 1 - (distance * 0.15));
                    opacity = Math.max(0.2, 0.7 - (distance * 0.2));
                    blur = Math.min(4, distance * 1.5);
                    zIndex = 100 - distance;
                }

                return (
                  <motion.div
                    key={section.id}
                    onClick={() => handleItemClick(index)}
                    className={`
                      relative flex flex-col items-center justify-center
                      shrink-0 rounded-2xl cursor-pointer
                      border
                      ${isActive ? 'bg-primary border-primary/60' : 'bg-muted/40 border-border/30'}
                    `}
                    style={{
                      width: `${ITEM_WIDTH}px`,
                      height: `${ITEM_WIDTH}px`,
                      marginLeft: index === 0 ? 0 : `${GAP}px`,
                      transform: `scale(${scale})`,
                      opacity: opacity,
                      filter: `blur(${blur}px)`,
                      zIndex: zIndex, 
                      boxShadow: isActive 
                        ? '0 20px 50px -10px hsl(var(--primary) / 0.5), 0 0 15px hsl(var(--primary) / 0.3) inset' 
                        : 'none'
                    }}
                    whileHover={{ 
                      boxShadow: isActive 
                        ? '0 20px 50px -10px hsl(var(--primary) / 0.5), 0 0 15px hsl(var(--primary) / 0.3) inset, 0 0 20px hsl(var(--primary) / 0.8)' 
                        : '0 0 20px hsl(var(--primary) / 0.6), 0 0 10px hsl(var(--primary) / 0.4) inset'
                    }}
                  >
                    <section.icon className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400'}`} size={32} />
                    <span className={`mt-2 text-xs font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {section.label}
                    </span>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
          
          <div className="flex justify-center gap-4 mt-8">
            <button 
              onClick={() => setActiveIndex(activeIndex === 0 ? SECTIONS.length - 1 : activeIndex - 1)}
              className="p-3 rounded-full bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm border border-border text-gray-400 hover:text-blue-400 transition-colors"
              aria-label="Previous Section"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={() => setActiveIndex((activeIndex + 1) % SECTIONS.length)}
              className="p-3 rounded-full bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm border border-border text-gray-400 hover:text-blue-400 transition-colors"
              aria-label="Next Section"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Content rendering based on active section */}
        {renderContent()}
        </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
