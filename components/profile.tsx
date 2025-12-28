'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, Save, Camera, Edit2, Check, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface UserProfile {
  name: string
  email: string
  phone: string
  bio: string
  location: string
  website: string
  joinedDate: string
  learningPreferences: string[]
  notificationSettings: {
    email: boolean
    push: boolean
    updates: boolean
  }
}

export function Profile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    joinedDate: new Date().toLocaleDateString(),
    learningPreferences: ['Visual Learning', 'Interactive Content'],
    notificationSettings: {
      email: true,
      push: true,
      updates: false
    }
  })

  const [tempProfile, setTempProfile] = useState<UserProfile>(profile)

  useEffect(() => {
    // Load profile from localStorage if available, keyed by user email
    if (user?.email) {
      const savedProfile = localStorage.getItem(`sophi_profile_${user.email}`)
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile)
          setProfile(parsed)
          setTempProfile(parsed)
        } catch (error) {
          console.error('Error loading profile:', error)
        }
      } else {
        // Initialize profile with current user data if no saved profile exists
        const initialProfile = {
          name: user.name || '',
          email: user.email || '',
          phone: '',
          bio: '',
          location: '',
          website: '',
          joinedDate: new Date().toLocaleDateString(),
          learningPreferences: ['Visual Learning', 'Interactive Content'],
          notificationSettings: {
            email: true,
            push: true,
            updates: false
          }
        }
        setProfile(initialProfile)
        setTempProfile(initialProfile)
      }
    }
  }, [user])

  const handleEdit = () => {
    setTempProfile(profile)
    setIsEditing(true)
    setSaved(false)
  }

  const handleCancel = () => {
    setTempProfile(profile)
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update profile
    setProfile(tempProfile)
    
    // Save to localStorage with user-specific key
    if (user?.email) {
      localStorage.setItem(`sophi_profile_${user.email}`, JSON.stringify(tempProfile))
    }
    
    // Update user context if name changed
    if (tempProfile.name !== user?.name) {
      // Note: In a real app, you would call an API to update the user's name
      // For now, we just save to localStorage
      console.log('Profile name updated:', tempProfile.name)
    }
    
    setIsSaving(false)
    setIsEditing(false)
    setSaved(true)
    
    setTimeout(() => setSaved(false), 3000)
  }

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const preferenceOptions = [
    'Visual Learning',
    'Interactive Content',
    'Audio Learning',
    'Text-based Learning',
    'Video Tutorials',
    'Practice Problems'
  ]

  const stats = [
    { label: 'Videos Created', value: '12' },
    { label: 'Learning Hours', value: '24.5' },
    { label: 'Completed Courses', value: '3' },
    { label: 'Achievement Points', value: '850' }
  ]

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Profile</h1>
          <p className="text-[var(--foreground)]/60">Manage your account settings and preferences</p>
        </div>
        
        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 rounded-lg"
          >
            <Check size={16} />
            <span className="text-sm font-medium">Profile Updated</span>
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Profile Card */}
          <div className="bg-[var(--secondary)]/50 border border-[var(--border)] rounded-xl p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-[var(--accent)] flex items-center justify-center mx-auto mb-4">
                  <User size={48} className="text-[var(--accent-foreground)]" />
                </div>
                <button className="absolute bottom-2 right-0 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center border-2 border-[var(--background)]">
                  <Camera size={16} className="text-[var(--accent-foreground)]" />
                </button>
              </div>
              
              <h2 className="text-xl font-semibold">{profile.name}</h2>
              <p className="text-[var(--foreground)]/60">{profile.email}</p>
              
              {profile.bio && (
                <p className="mt-4 text-sm text-[var(--foreground)]/80">{profile.bio}</p>
              )}
              
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--foreground)]/60">
                <Calendar size={14} />
                <span>Joined {profile.joinedDate}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[var(--secondary)]/50 border border-[var(--border)] rounded-xl p-6">
            <h3 className="font-semibold mb-4">Learning Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-[var(--accent)]">{stat.value}</p>
                  <p className="text-xs text-[var(--foreground)]/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Personal Information */}
          <div className="bg-[var(--secondary)]/50 border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/80 rounded-lg text-[var(--accent-foreground)] font-medium transition-colors"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 rounded-lg font-medium transition-colors"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/80 rounded-lg text-[var(--accent-foreground)] font-medium transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={isEditing ? tempProfile.name : profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg opacity-50"
                />
                <p className="text-xs text-[var(--foreground)]/60 mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={isEditing ? tempProfile.phone : profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all disabled:opacity-50"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={isEditing ? tempProfile.location : profile.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all disabled:opacity-50"
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={isEditing ? tempProfile.bio : profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all resize-none disabled:opacity-50"
                placeholder="Tell us about yourself and your learning goals..."
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Website</label>
              <input
                type="url"
                value={isEditing ? tempProfile.website : profile.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all disabled:opacity-50"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          {/* Learning Preferences */}
          <div className="bg-[var(--secondary)]/50 border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Learning Preferences</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {preferenceOptions.map((preference) => (
                <label key={preference} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(isEditing ? tempProfile : profile).learningPreferences.includes(preference)}
                    onChange={(e) => {
                      const current = isEditing ? tempProfile : profile
                      const updated = e.target.checked
                        ? [...current.learningPreferences, preference]
                        : current.learningPreferences.filter(p => p !== preference)
                      handleInputChange('learningPreferences', updated)
                    }}
                    disabled={!isEditing}
                    className="rounded border-[var(--border)] bg-[var(--background)] text-[var(--accent)] focus:ring-[var(--accent)] disabled:opacity-50"
                  />
                  <span className="text-sm">{preference}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-[var(--secondary)]/50 border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
            <div className="space-y-3">
              {Object.entries((isEditing ? tempProfile : profile).notificationSettings).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm capitalize">{key} Notifications</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => {
                      const current = isEditing ? tempProfile : profile
                      handleInputChange('notificationSettings', {
                        ...current.notificationSettings,
                        [key]: e.target.checked
                      })
                    }}
                    disabled={!isEditing}
                    className="rounded border-[var(--border)] bg-[var(--background)] text-[var(--accent)] focus:ring-[var(--accent)] disabled:opacity-50"
                  />
                </label>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
