import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, MapPin, Shield, Camera, Save, Upload } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

const Profile = () => {
  const { user, login, setUserContext } = useAuth()
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    country: '',
    currency: '',
    twoFAEnabled: false,
    profile_photo: null,
    phone: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  const countries = [
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
    { code: 'NG', name: 'Nigeria', currency: 'NGN' },
    { code: 'GH', name: 'Ghana', currency: 'GHS' }
  ]

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile/')
      const userData = response.data.data
      setProfile({
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email || '',
        country: userData.country || '',
        currency: userData.currency || 'USD',
        twoFAEnabled: userData.twoFAEnabled || false,
        profile_photo: userData.profilePhoto || null,
        phone: userData.phone || ''
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('firstName', profile.name.split(' ')[0] || '')
      formData.append('lastName', profile.name.split(' ').slice(1).join(' ') || '')
      formData.append('country', profile.country)
      formData.append('phone', profile.phone)
      if (profile.profile_photo && typeof profile.profile_photo !== 'string') {
        formData.append('profilePhoto', profile.profile_photo)
      }

      const response = await api.put('/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Update auth context with new user data
      const updatedUser = { ...user, ...response.data.data }
      setUserContext(updatedUser)

      // Update local profile state with the response data
      setProfile(prevProfile => ({
        ...prevProfile,
        name: `${response.data.data.firstName || ''} ${response.data.data.lastName || ''}`.trim(),
        email: response.data.data.email || prevProfile.email,
        country: response.data.data.country || prevProfile.country,
        phone: response.data.data.phone || prevProfile.phone,
        profile_photo: response.data.data.profilePhoto || prevProfile.profile_photo
      }))

      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setProfile({ ...profile, profile_photo: file })
    }
  }

  const getProfilePhotoUrl = () => {
    if (profile.profile_photo) {
      if (typeof profile.profile_photo === 'string') {
        // Backend returns filename, construct full URL
        return `${api.defaults.baseURL}/uploads/${profile.profile_photo}`
      } else {
        return URL.createObjectURL(profile.profile_photo)
      }
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-primary-900 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-silver">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-primary-900 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-heading font-bold text-primary dark:text-cream mb-2">
            Profile Settings
          </h1>
          <p className="text-silver dark:text-silver">
            Manage your account information and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  {getProfilePhotoUrl() ? (
                    <img
                      src={getProfilePhotoUrl()}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gold"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-r from-gold to-gold-400 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                      {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    </div>
                  )}
                  <button
                    onClick={() => isEditing && fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-primary text-cream p-2 rounded-full hover:bg-primary-600 transition-colors"
                  >
                    <Camera size={16} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <h2 className="text-xl font-heading font-semibold text-primary dark:text-cream">
                  {profile.name}
                </h2>
                <p className="text-silver">{profile.email}</p>
                
                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center space-x-3 text-silver">
                    <MapPin size={16} />
                    <span>{countries.find(c => c.code === profile.country)?.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-silver">
                    <Shield size={16} />
                    <span>2FA {profile.twoFAEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">
                  Personal Information
                </h3>
                <Button
                  variant={isEditing ? "primary" : "secondary"}
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver" size={20} />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        disabled={!isEditing}
                        className="w-full pl-12 pr-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                      Country
                    </label>
                    <select
                      value={profile.country}
                      onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent disabled:opacity-50"
                    >
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name} ({country.currency})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-700 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-primary dark:text-cream">Two-Factor Authentication</h4>
                      <p className="text-sm text-silver">Extra security for your account</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm ${profile.twoFAEnabled ? 'text-success' : 'text-silver'}`}>
                        {profile.twoFAEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <Button variant="secondary" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile