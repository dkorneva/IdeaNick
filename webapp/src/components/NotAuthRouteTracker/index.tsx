import { atom } from 'nanostores'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getAllIdeasRoute, getSignUpRoute, getSignOutRoute, getSignInRoute } from '../../lib/routes'

export const lastVisitedNotAuthRouteStore = atom(getAllIdeasRoute()) // getAllIdeasRoute - дефолтное значение

export const NotAuthRouteTracker = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    const authRoutes = [getSignUpRoute(), getSignInRoute(), getSignOutRoute()]
    const isAuthRoute = authRoutes.includes(pathname)
    if (!isAuthRoute) {
      lastVisitedNotAuthRouteStore.set(pathname)
    }
  }, [pathname])
  return null
}
