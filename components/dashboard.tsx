'use client'

import { motion } from 'framer-motion'
import { Upload, FolderOpen, Play, TrendingUp, Clock, Star } from 'lucide-react'

export function Dashboard({ onCreateNew }: { onCreateNew: () => void }) {
  const stats = [
    { label: 'Videos Created', value: '12', icon: Play, color: 'bg-blue-500' },
    { label: 'Total Library Items', value: '24', icon: FolderOpen, color: 'bg-green-500' },
    { label: 'Hours Saved', value: '8.5', icon: Clock, color: 'bg-purple-500' },
    { label: 'Avg. Rating', value: '4.8', icon: Star, color: 'bg-yellow-500' },
  ]

  const recentActivity = [
    { id: 1, title: 'Introduction to Biology', type: 'Video', date: '2 hours ago', status: 'Completed' },
    { id: 2, title: 'Chemistry Formulas', type: 'Upload', date: '5 hours ago', status: 'Processing' },
    { id: 3, title: 'Mathematics Review', type: 'Video', date: '1 day ago', status: 'Completed' },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <h1 className="text-3xl md:text-4xl font-bold">Welcome back!</h1>
        <p className="text-[var(--foreground)]/60">Here's what's happening with your learning materials today.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
              className="bg-[var(--secondary)]/50 border border-[var(--border)] rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} bg-opacity-20 flex items-center justify-center`}>
                  <Icon size={24} className="text-current" />
                </div>
                <TrendingUp size={20} className="text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-[var(--foreground)]/60">{stat.label}</p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-[var(--secondary)]/50 border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button onClick={onCreateNew} className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--accent)] hover:bg-[var(--accent)]/80 rounded-lg transition-colors text-[var(--accent-foreground)]">
              <Upload size={20} />
              <span className="font-medium">Create New Video</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 rounded-lg transition-colors">
              <FolderOpen size={20} />
              <span className="font-medium">Browse Library</span>
            </button>
          </div>
        </div>

        <div className="bg-[var(--secondary)]/50 border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-[var(--foreground)]/60">{activity.type} • {activity.date}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  activity.status === 'Completed' 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent)]/5 border border-[var(--border)] rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold mb-2">Pro Tip</h2>
        <p className="text-[var(--foreground)]/80">
          Did you know? You can upload multiple files at once and create personalized videos for different learning styles. 
          Try combining text, images, and audio for the best results!
        </p>
      </motion.div>
    </div>
  )
}
