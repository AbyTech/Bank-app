import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PageLoader } from './UI/Loader'

/**
 * ProtectedRoute - route guard for authenticated-only pages.
 * While auth state is initialising (e.g. restoring the session after a page
 * refresh) it renders a loader instead of redirecting, so protected content is
 * never flashed to an unauthenticated visitor. Once loaded, unauthenticated
 * users are sent to /login (remembering where they came from so we could
 * redirect them back after login).
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return children
}

export default ProtectedRoute