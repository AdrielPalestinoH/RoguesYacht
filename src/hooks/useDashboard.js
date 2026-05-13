// src/hooks/useDashboard.js
import { useEffect, useState } from 'react'
import { supabase } from '../api/supabase'

export function useDashboard() {
  const [reservations, setReservations] = useState([])

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from('view_dashboard_reservations')
      .select('*')
    
    if (!error) setReservations(data)
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  return { reservations }
}