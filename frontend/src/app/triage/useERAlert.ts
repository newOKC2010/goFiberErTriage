'use client'
import { useEffect, useRef, useState } from 'react'
import { API_ENDPOINTS } from '@/global/globalApi'
import { ERAlert } from './TYPE'
import { getAudioCtx, playERBeep } from './audio'

type ERAlertLocal = ERAlert & { expiresAt: number }

function parseDurationMs(s?: string): number {
  if (!s) return 60_000
  const n = parseInt(s)
  if (isNaN(n)) return 60_000
  return s.endsWith('s') ? n * 1_000 : n * 60_000
}
const CARD_TTL_MS = parseDurationMs(process.env.NEXT_PUBLIC_TIME_CARD)

export function useERAlert() {
  const [alerts, setAlerts] = useState<ERAlert[]>([])
  const [connected, setConnected] = useState(false)
  const [soundOn, setSoundOn] = useState(false)

  const localAlerts = useRef<Map<string, ERAlertLocal>>(new Map())
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
      playERBeep()
      beepRef.current = setInterval(playERBeep, 3000)
    } else {
      if (beepRef.current) clearInterval(beepRef.current)
      beepRef.current = null
    }
  }

  // ลบ alert ออกจาก local ทันที (เรียกจากปุ่ม clear)
  function clearAlert(vn: string) {
    if (localAlerts.current.delete(vn)) {
      sync(localAlerts.current)
    }
  }

  // sync localAlerts → alerts state + จัดการ beep interval
  function sync(map: Map<string, ERAlertLocal>) {
    const list = Array.from(map.values())
    setAlerts(list)
    if (!soundOnRef.current) return
    if (list.length > 0 && !beepRef.current) {
      playERBeep()
      beepRef.current = setInterval(playERBeep, 3000)
    } else if (list.length === 0 && beepRef.current) {
      clearInterval(beepRef.current)
      beepRef.current = null
    }
  }

  // SSE connection
  useEffect(() => {
    const url = API_ENDPOINTS.ER.ALERTS_SSE
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
          const newAlerts: ERAlert[] | null = JSON.parse(e.data)
          if (!newAlerts) return

          // แสดง card ตาม NEXT_PUBLIC_TIME_CARD แล้วหายไปเอง
          const expiresAt = Date.now() + CARD_TTL_MS
          newAlerts.forEach((a) => {
            localAlerts.current.set(a.vn, { ...a, expiresAt })
          })
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

  // ลบ card ที่หมดเวลา (CARD_TTL) — จะกลับมาใหม่เมื่อ backend ส่งรอบถัดไป
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      let changed = false
      localAlerts.current.forEach((a, key) => {
        if (a.expiresAt <= now) {
          localAlerts.current.delete(key)
          changed = true
        }
      })
      if (changed) sync(localAlerts.current)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return { alerts, connected, soundOn, toggleSound, clearAlert }
}
