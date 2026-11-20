'use client'
import { useEffect, useRef, useState } from 'react'
import { API_ENDPOINTS } from '@/global/globalApi'
import { ERAlert, ERAlertCardData } from './TYPE'
import { getAudioCtx, playERBeep } from './audio'

// alertUntil = เวลาที่หยุดกระพริบ + เสียง (0 = card ค้างนิ่ง)
type ERAlertLocal = ERAlert & { alertUntil: number }

function parseDurationMs(s?: string): number {
  if (!s) return 60_000
  const n = parseInt(s)
  if (isNaN(n)) return 60_000
  return s.endsWith('s') ? n * 1_000 : n * 60_000
}
const ALERT_MS = parseDurationMs(process.env.NEXT_PUBLIC_TIME_CARD)

export function useERAlert() {
  const [alerts, setAlerts] = useState<ERAlertCardData[]>([])
  const [connected, setConnected] = useState(false)
  const [soundOn, setSoundOn] = useState(false)

  const localAlerts = useRef<Map<string, ERAlertLocal>>(new Map())
  const esRef = useRef<EventSource | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const beepRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const destroyed = useRef(false)
  const soundOnRef = useRef(false)

  // sync localAlerts → alerts state + เสียงดังเฉพาะตอนมี card กระพริบ
  function sync() {
    const now = Date.now()
    const list = Array.from(localAlerts.current.values(), ({ alertUntil, ...a }) => ({
      ...a,
      blinking: alertUntil > now,
    }))
    setAlerts(list)

    const shouldBeep = soundOnRef.current && list.some((a) => a.blinking)
    if (shouldBeep && !beepRef.current) {
      playERBeep()
      beepRef.current = setInterval(playERBeep, 3000)
    } else if (!shouldBeep && beepRef.current) {
      clearInterval(beepRef.current)
      beepRef.current = null
    }
  }

  function toggleSound() {
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume()
    soundOnRef.current = !soundOnRef.current
    setSoundOn(soundOnRef.current)
    sync()
  }

  // ลบ alert ออกจาก local ทันที (เรียกจากปุ่ม clear)
  function clearAlert(vn: string) {
    if (localAlerts.current.delete(vn)) sync()
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
          // backend ส่ง card ที่ active ทั้งหมด — vn ที่ไม่อยู่ในรายการ = ลบ card
          const list: ERAlert[] = JSON.parse(e.data) ?? []
          const now = Date.now()
          const next = new Map<string, ERAlertLocal>()
          list.forEach((a) => {
            const prev = localAlerts.current.get(a.vn)
            next.set(a.vn, {
              ...a,
              alertUntil: a.alert ? now + ALERT_MS : (prev?.alertUntil ?? 0),
            })
          })
          localAlerts.current = next
          sync()
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
      beepRef.current = null
      esRef.current?.close()
    }
  }, [])

  // ครบเวลา NEXT_PUBLIC_TIME_CARD → หยุดกระพริบ + เสียง แต่ card ยังแสดงค้างไว้
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      let changed = false
      localAlerts.current.forEach((a) => {
        if (a.alertUntil && a.alertUntil <= now) {
          a.alertUntil = 0
          changed = true
        }
      })
      if (changed) sync()
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return { alerts, connected, soundOn, toggleSound, clearAlert }
}
