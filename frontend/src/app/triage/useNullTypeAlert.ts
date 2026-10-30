'use client'
import { useEffect, useRef, useState } from 'react'
import { API_ENDPOINTS } from '@/global/globalApi'
import { NullTypeAlert } from './TYPE'
import { getAudioCtx, playNullBeep } from './audio'

type NullAlertLocal = NullTypeAlert & { expiresAt: number }

const CARD_TTL_MS = 60_000

export function useNullTypeAlert() {
  const [alerts, setAlerts] = useState<NullTypeAlert[]>([])
  const [connected, setConnected] = useState(false)
  const [soundOn, setSoundOn] = useState(false)

  const localAlerts = useRef<Map<string, NullAlertLocal>>(new Map())
  const esRef = useRef<EventSource | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const beepRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const destroyed = useRef(false)
  const soundOnRef = useRef(false)

  function toggleSound() {
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const next = !soundOnRef.current
    soundOnRef.current = next
    setSoundOn(next)
    if (next && localAlerts.current.size > 0) {
      playNullBeep()
      beepRef.current = setInterval(playNullBeep, 3000)
    } else {
      if (beepRef.current) clearInterval(beepRef.current)
      beepRef.current = null
    }
  }

  function sync(map: Map<string, NullAlertLocal>) {
    const list = Array.from(map.values())
    setAlerts(list)
    if (!soundOnRef.current) return
    if (list.length > 0 && !beepRef.current) {
      playNullBeep()
      beepRef.current = setInterval(playNullBeep, 3000)
    } else if (list.length === 0 && beepRef.current) {
      clearInterval(beepRef.current)
      beepRef.current = null
    }
  }

  useEffect(() => {
    const url = API_ENDPOINTS.ER.NULL_TYPE_SSE
    if (!url) return
    destroyed.current = false

    function connect() {
      if (destroyed.current) return
      const es = new EventSource(url)
      esRef.current = es

      es.onopen = () => setConnected(true)

      es.onmessage = (e) => {
        if (!e.data || e.data.trim() === '') return
        try {
          const list: NullTypeAlert[] | null = JSON.parse(e.data)
          // replace snapshot: ถ้า [] → ลบทุก card ทันที
          const newMap = new Map<string, NullAlertLocal>()
          if (list && list.length > 0) {
            const expiry = Date.now() + CARD_TTL_MS
            list.forEach((a) => newMap.set(a.vn, { ...a, expiresAt: expiry }))
          }
          localAlerts.current = newMap
          sync(localAlerts.current)
        } catch {}
      }

      es.onerror = () => {
        if (destroyed.current) return
        setConnected(false)
        es.close()
        retryRef.current = setTimeout(connect, 3000)
      }
    }

    connect()
    return () => {
      destroyed.current = true
      if (retryRef.current) clearTimeout(retryRef.current)
      if (beepRef.current) clearInterval(beepRef.current)
      esRef.current?.close()
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      let changed = false
      localAlerts.current.forEach((a, key) => {
        if (a.expiresAt <= now) { localAlerts.current.delete(key); changed = true }
      })
      if (changed) sync(localAlerts.current)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return { alerts, connected, soundOn, toggleSound }
}
