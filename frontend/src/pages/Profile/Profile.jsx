import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  MapPin,
  Shield,
  Camera,
  Save,
  Pencil,
  Copy,
  Check,
  Phone,
  CreditCard,
  Lock,
  KeyRound,
  Calendar,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Card, { CardContent, CardHeader } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import PinInput from '../../components/UI/PinInput'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

const inputClass =
  'w-full px-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-primary dark:text-cream placeholder:text-silver'

const Profile = () => {
  const { user, setUserContext } = useAuth()
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    phone: '',
    profilePhoto: null,
    accountNumber: '',
    createdAt: '',
    accountStatus: 'active',
  })
  const [countries, setCountries] = useState([])
  const [cards, setCards] = useState([])
  const [pinSet, setPinSet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [copiedAccount, setCopiedAccount] = useState(false)
  const [showSetPinModal, setShowSetPinModal] = useState(false)
  const [showChangePinModal, setShowChangePinModal] = useState(false)
  const fileInputRef = useRef(null)

  // Set PIN modal state
  const [setPin, setSetPin] = useState('')
  const [setConfirmPin, setSetConfirmPin] = useState('')
  const [setPinError, setSetPinError] = useState('')
  const [setPinSaving, setSetPinSaving] = useState(false)
  const [setPinSuccess, setSetPinSuccess] = useState(false)

  // Change PIN modal state
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [changeConfirmPin, setChangeConfirmPin] = useState('')
  const [changePinError, setChangePinError] = useState('')
  const [changePinSaving, setChangePinSaving] = useState(false)
  const [changePinSuccess, setChangePinSuccess] = useState(false)

  const resetSetPin = () => {
    setSetPin('')
    setSetConfirmPin('')
    setSetPinError('')
    setSetPinSuccess(false)
  }

  const resetChangePin = () => {
    setCurrentPin('')
    setNewPin('')
    setChangeConfirmPin('')
    setChangePinError('')
    setChangePinSuccess(false)
  }

  const handleSetTransactionPin = async () => {
    setSetPinError('')
    if (!setPin || setPin.length !== 4 || !setConfirmPin || setConfirmPin.length !== 4) {
      setSetPinError('Please enter and confirm your 4-digit transaction PIN.')
      return
    }
    if (setPin !== setConfirmPin) {
      setSetPinError('PINs do not match. Please try again.')
      return
    }
    setSetPinSaving(true)
    try {
      await api.post('/api/profile/transaction-pin', { pin: setPin, confirmPin: setConfirmPin })
      setPinSet(true)
      setSetPinSuccess(true)
      toast.success('Transaction PIN created successfully!')
      setTimeout(() => {
        setShowSetPinModal(false)
        resetSetPin()
      }, 1800)
    } catch (error) {
      setSetPinError(error.response?.data?.error || 'Failed to create transaction PIN.')
    } finally {
      setSetPinSaving(false)
    }
  }

  const handleChangeTransactionPin = async () => {
    setChangePinError('')
    if (!currentPin || currentPin.length !== 4 || !newPin || newPin.length !== 4 || !changeConfirmPin || changeConfirmPin.length !== 4) {
      setChangePinError('Please enter your current PIN and a new 4-digit PIN (with confirmation).')
      return
    }
    if (newPin !== changeConfirmPin) {
      setChangePinError('New PINs do not match. Please try again.')
      return
    }
    setChangePinSaving(true)
    try {
      await api.put('/api/profile/transaction-pin', {
        currentPin,
        newPin,
        confirmNewPin: changeConfirmPin,
      })
      setPinSet(true)
      setChangePinSuccess(true)
      toast.success('Transaction PIN changed successfully!')
      setTimeout(() => {
        setShowChangePinModal(false)
        resetChangePin()
      }, 1800)
    } catch (error) {
      setChangePinError(error.response?.data?.error || 'Failed to change transaction PIN.')
    } finally {
      setChangePinSaving(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchProfile()
      api.get('/api/countries')
        .then((res) => setCountries(res.data.data || []))
        .catch(() => setCountries([]))
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/profile/')
      const userData = response.data.data

      let accountNumber = ''
      try {
        const accountResponse = await api.get('/api/accounts/')
        if (accountResponse.data.data && accountResponse.data.data.length > 0) {
          accountNumber = accountResponse.data.data[0].accountNumber
        }
      } catch (accountError) {
        console.error('Failed to fetch account:', accountError)
      }

      let userCards = []
      try {
        const cardsResponse = await api.get('/api/cards/')
        userCards = cardsResponse.data.data || []
      } catch (cardsError) {
        console.error('Failed to fetch cards:', cardsError)
      }

      setProfile({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        country: userData.country || '',
        phone: userData.phone || '',
        profilePhoto: userData.profilePhoto || null,
        accountNumber,
        createdAt: userData.createdAt || '',
        accountStatus: userData.accountStatus || 'active',
      })
      setCards(userCards)
      setPinSet(Boolean(userData.transactionPinSet))
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('firstName', profile.firstName)
      formData.append('lastName', profile.lastName)
      formData.append('country', profile.country)
      formData.append('phone', profile.phone)

      const response = await api.put('/api/profile/', formData)
      const updatedUser = { ...user, ...response.data.data }
      setUserContext(updatedUser)
      setProfile((prev) => ({
        ...prev,
        firstName: response.data.data.firstName || prev.firstName,
        lastName: response.data.data.lastName || prev.lastName,
        country: response.data.data.country || prev.country,
        phone: response.data.data.phone || prev.phone,
        accountStatus: response.data.data.accountStatus || prev.accountStatus,
      }))
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error(error.response?.data?.error || 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller.')
      return
    }

    setUploadingPhoto(true)
    setUploadProgress(0)
    try {
      const formData = new FormData()
      formData.append('profilePhoto', file)
      const response = await api.put('/api/profile/', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100))
          }
        },
      })
      const updated = response.data.data
      setProfile((prev) => ({ ...prev, profilePhoto: updated.profilePhoto || prev.profilePhoto }))
      setUserContext({ ...user, ...updated })
      toast.success('Profile picture updated!')
    } catch (error) {
      console.error('Failed to upload profile picture:', error)
      toast.error(error.response?.data?.error || 'Failed to upload profile picture. Please try again.')
    } finally {
      setUploadingPhoto(false)
      setUploadProgress(null)
      event.target.value = ''
    }
  }

  const copyAccountNumber = async () => {
    if (!profile.accountNumber) return
    try {
      await navigator.clipboard.writeText(profile.accountNumber)
      setCopiedAccount(true)
      toast.success('Account number copied!')
      setTimeout(() => setCopiedAccount(false), 2000)
    } catch (error) {
      toast.error('Failed to copy account number.')
    }
  }

  const getProfilePhotoUrl = () => {
    if (!profile.profilePhoto) return null
    if (typeof profile.profilePhoto === 'string' && profile.profilePhoto.startsWith('http')) {
      return profile.profilePhoto
    }
    if (typeof profile.profilePhoto === 'string') {
      return `${api.defaults.baseURL}/uploads/${profile.profilePhoto}`
    }
    return null
  }

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || 'U'
  const activeCards = cards.filter((c) => c.status === 'active').length

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-primary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-silver">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-primary-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-heading font-bold text-primary dark:text-cream mb-2">
            Profile Settings
          </h1>
          <p className="text-silver dark:text-silver">
            Manage your personal information, security and cards
          </p>
        </motion.div>

        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 p-6 sm:p-8 text-white mb-8"
        >
          <div className="pointer-events-none absolute -top-20 -right-16 w-64 h-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 w-56 h-56 rounded-full bg-primary-500/30 blur-3xl" />

          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              {getProfilePhotoUrl() ? (
                <img
                  src={getProfilePhotoUrl()}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-gold/70 shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gold to-gold-600 flex items-center justify-center text-4xl font-bold border-4 border-white/20 shadow-xl">
                  {initials}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                aria-label="Change profile picture"
                className="absolute bottom-1 right-1 bg-gold text-white p-2.5 rounded-full shadow-lux-gold hover:bg-gold-600 transition-colors disabled:opacity-60"
              >
                {uploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              {uploadProgress !== null && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 bg-black/80 text-white text-[10px] font-bold rounded-full py-0.5 px-2 text-center">
                  {uploadProgress}%
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h2 className="font-heading font-bold text-2xl sm:text-3xl truncate">
                {`${profile.firstName} ${profile.lastName}`.trim() || 'PrimeWave User'}
              </h2>
              <p className="text-white/70 text-sm mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail size={14} /> {profile.email}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  profile.accountStatus === 'inactive'
                    ? 'bg-danger/80 text-white border-danger/40'
                    : 'bg-white/10 text-white border-success/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${profile.accountStatus === 'inactive' ? 'bg-white' : 'bg-success'}`} />
                  {profile.accountStatus === 'inactive' ? 'Inactive' : 'Active'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white/90">
                  <CreditCard size={12} /> {activeCards} active card{activeCards === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* Account number */}
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-center sm:text-left w-full sm:w-auto shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-white/60 mb-1">Account Number</p>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <p className="font-mono font-semibold text-sm sm:text-base">{profile.accountNumber || '—'}</p>
                {profile.accountNumber && (
                  <button
                    onClick={copyAccountNumber}
                    aria-label="Copy account number"
                    className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {copiedAccount ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personal information */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">
                  Personal Information
                </h3>
                <Button
                  variant={isEditing ? 'primary' : 'secondary'}
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : isEditing ? <Save size={16} /> : <Pencil size={16} />}
                  <span>{saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary dark:text-cream mb-2">First Name</label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        disabled={!isEditing}
                        className={inputClass}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary dark:text-cream mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        disabled={!isEditing}
                        className={inputClass}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary dark:text-cream mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-silver" size={18} />
                      <input type="email" value={profile.email} disabled className={`${inputClass} pl-10`} />
                    </div>
                    <p className="text-xs text-silver mt-1">Email cannot be changed here — contact support for email changes.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary dark:text-cream mb-2">Country</label>
                      <select
                        value={profile.country}
                        onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                        disabled={!isEditing}
                        className={inputClass}
                      >
                        <option value="">Select country</option>
                        {countries.map((c) => (
                          <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary dark:text-cream mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-silver" size={18} />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          disabled={!isEditing}
                          className={`${inputClass} pl-10`}
                          placeholder="+1 555 000 0000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My cards summary */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">My Cards</h3>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => { window.location.href = '/cards' }}
                  className="flex items-center gap-2"
                >
                  <CreditCard size={15} />
                  Manage Cards
                </Button>
              </CardHeader>
              <CardContent>
                {cards.length === 0 ? (
                  <div className="flex flex-col items-center text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-3">
                      <CreditCard className="text-gold" size={26} />
                    </div>
                    <p className="text-sm text-primary dark:text-cream font-medium mb-1">No cards yet</p>
                    <p className="text-xs text-silver mb-4">Order a virtual or physical card from the Cards page.</p>
                    <Button variant="primary" size="sm" onClick={() => { window.location.href = '/cards' }}>
                      Get a Card
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cards.slice(0, 3).map((card) => (
                      <div key={card._id} className="flex items-center justify-between p-3 rounded-xl bg-cream dark:bg-primary-700/50">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-primary-600/10 flex items-center justify-center shrink-0">
                            <CreditCard size={16} className="text-primary-600 dark:text-gold-300" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-primary dark:text-cream truncate">{card.cardName}</p>
                            <p className="text-xs text-silver">
                              •••• {card.cardNumber?.slice(-4)} · {card.type}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border shrink-0 ${
                          card.status === 'active'
                            ? 'bg-success/15 text-success border-success/30'
                            : card.status === 'rejected'
                            ? 'bg-danger/10 text-danger border-danger/30'
                            : 'bg-gold/10 text-gold border-gold/40'
                        }`}>
                          {card.status === 'pending_payment' ? 'Payment' : card.status}
                        </span>
                      </div>
                    ))}
                    {cards.length > 3 && (
                      <p className="text-xs text-silver text-center pt-1">
                        +{cards.length - 3} more · <button onClick={() => { window.location.href = '/cards' }} className="text-gold hover:underline">view all</button>
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction PIN security */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream flex items-center gap-2">
                  <Lock size={18} className="text-gold" />
                  Transaction PIN
                </h3>
              </CardHeader>
              <CardContent>
                <div className="bg-primary-50 dark:bg-primary-700 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${pinSet ? 'bg-success/15 text-success' : 'bg-gold/15 text-gold'}`}>
                        {pinSet ? <CheckCircle2 size={20} /> : <KeyRound size={20} />}
                      </div>
                      <div>
                        <p className="font-semibold text-primary dark:text-cream">{pinSet ? 'PIN Set' : 'No PIN Set'}</p>
                        <p className="text-xs text-silver">Used to authorize transactions</p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-silver mb-4 leading-relaxed">
                  Your transaction PIN is a 4-digit code used to authorize money movements. It is encrypted and completely separate from any card PIN.
                </p>

                {pinSet ? (
                  <Button variant="secondary" className="w-full flex items-center justify-center gap-2" onClick={() => setShowChangePinModal(true)}>
                    <KeyRound size={16} />
                    Change Transaction PIN
                  </Button>
                ) : (
                  <Button variant="brand" className="w-full flex items-center justify-center gap-2" onClick={() => setShowSetPinModal(true)}>
                    <Lock size={16} />
                    Set Transaction PIN
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Account information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream flex items-center gap-2">
                  <User size={18} className="text-gold" />
                  Account Information
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-silver/20 dark:border-primary-700">
                    <span className="text-silver flex items-center gap-2"><Mail size={14} /> Email</span>
                    <span className="font-medium text-primary dark:text-cream truncate ml-3">{profile.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-silver/20 dark:border-primary-700">
                    <span className="text-silver flex items-center gap-2"><MapPin size={14} /> Country</span>
                    <span className="font-medium text-primary dark:text-cream capitalize">
                      {countries.find((c) => c.code === profile.country)?.name || profile.country || '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-silver/20 dark:border-primary-700">
                    <span className="text-silver flex items-center gap-2"><Calendar size={14} /> Member Since</span>
                    <span className="font-medium text-primary dark:text-cream">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-silver flex items-center gap-2"><Shield size={14} /> Account Status</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      profile.accountStatus === 'inactive'
                        ? 'bg-danger/10 text-danger border-danger/30'
                        : 'bg-success/15 text-success border-success/30'
                    }`}>
                      {profile.accountStatus === 'inactive' ? 'Inactive' : 'Active'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Set transaction PIN modal */}
        <Modal
          isOpen={showSetPinModal}
          onClose={() => { setShowSetPinModal(false); resetSetPin() }}
          title="Create Transaction PIN"
          size="sm"
        >
          {setPinSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-success" size={32} />
              </div>
              <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream mb-1">PIN Created</h3>
              <p className="text-sm text-silver">Your transaction PIN is ready to use.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-silver">
                Create a secure 4-digit transaction PIN. It will be used to authorize transactions.
              </p>
              <div className="text-center">
                <p className="text-sm font-medium text-primary dark:text-cream mb-3">Enter PIN</p>
                <PinInput value={setPin} onChange={setSetPin} autoFocus />
                <p className="text-sm font-medium text-primary dark:text-cream mt-5 mb-3">Confirm PIN</p>
                <PinInput value={setConfirmPin} onChange={setSetConfirmPin} />
              </div>
              {setPinError && (
                <div className="flex items-start gap-2 bg-danger-light dark:bg-danger/10 border border-danger/30 rounded-xl p-3">
                  <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
                  <p className="text-sm text-danger-dark dark:text-danger-light">{setPinError}</p>
                </div>
              )}
              <Button
                variant="brand"
                className="w-full"
                loading={setPinSaving}
                disabled={setPin.length !== 4 || setConfirmPin.length !== 4}
                onClick={handleSetTransactionPin}
              >
                Create PIN
              </Button>
            </div>
          )}
        </Modal>

        {/* Change transaction PIN modal */}
        <Modal
          isOpen={showChangePinModal}
          onClose={() => { setShowChangePinModal(false); resetChangePin() }}
          title="Change Transaction PIN"
          size="sm"
        >
          {changePinSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-success" size={32} />
              </div>
              <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream mb-1">PIN Updated</h3>
              <p className="text-sm text-silver">Your transaction PIN has been changed.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-silver">
                Enter your current transaction PIN, then choose a new 4-digit PIN.
              </p>
              <div className="text-center space-y-5">
                <div>
                  <p className="text-sm font-medium text-primary dark:text-cream mb-3">Current PIN</p>
                  <PinInput value={currentPin} onChange={setCurrentPin} autoFocus />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary dark:text-cream mb-3">New PIN</p>
                  <PinInput value={newPin} onChange={setNewPin} />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary dark:text-cream mb-3">Confirm New PIN</p>
                  <PinInput value={changeConfirmPin} onChange={setChangeConfirmPin} />
                </div>
              </div>
              {changePinError && (
                <div className="flex items-start gap-2 bg-danger-light dark:bg-danger/10 border border-danger/30 rounded-xl p-3">
                  <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
                  <p className="text-sm text-danger-dark dark:text-danger-light">{changePinError}</p>
                </div>
              )}
              <Button
                variant="brand"
                className="w-full"
                loading={changePinSaving}
                disabled={currentPin.length !== 4 || newPin.length !== 4 || changeConfirmPin.length !== 4}
                onClick={handleChangeTransactionPin}
              >
                Change PIN
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default Profile
