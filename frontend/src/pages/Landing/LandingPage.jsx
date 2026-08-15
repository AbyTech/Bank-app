import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LandingNavbar from './LandingNavbar'
import LandingHero from './LandingHero'
import LandingSections from './LandingSections'
import LandingShowcase from './LandingShowcase'
import LandingFooter from './LandingFooter'

/**
 * Public marketing landing page.
 * Authenticated users are sent to the dashboard; guests see the marketing content.
 */
const LandingPage = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen bg-white dark:bg-primary-900 overflow-x-hidden">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingSections />
        <LandingShowcase />
      </main>
      <LandingFooter />
    </div>
  )
}

export default LandingPage
