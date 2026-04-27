import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'

interface PlanState {
  plan: string
  status: string
  isPaid: boolean
  loading: boolean
  refetch: () => Promise<void>
}

const UserPlanContext = createContext<PlanState>({
  plan: 'free',
  status: 'inactive',
  isPaid: false,
  loading: true,
  refetch: async () => {},
})

export function UserPlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState('free')
  const [status, setStatus] = useState('inactive')
  const [loading, setLoading] = useState(true)

  const fetchPlan = useCallback(async () => {
    try {
      const res = await api.get('/payments/subscription')
      setPlan(res.data.subscription?.tier || 'free')
      setStatus(res.data.subscription?.status || 'inactive')
    } catch {
      // leave free defaults
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  const refetch = async () => {
    setLoading(true)
    await fetchPlan()
  }

  const isPaid = status === 'active' && (plan === 'pro' || plan === 'business')

  return (
    <UserPlanContext.Provider value={{ plan, status, isPaid, loading, refetch }}>
      {children}
    </UserPlanContext.Provider>
  )
}

export const usePlan = () => useContext(UserPlanContext)