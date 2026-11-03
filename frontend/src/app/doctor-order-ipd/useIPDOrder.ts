'use client'
import { useEffect, useRef, useState } from 'react'
import { API_ENDPOINTS } from '@/global/globalApi'
import { IPDOrderAlert } from './TYPE'
import { getAudioCtx } from '@/app/triage/audio'

// เสียง IPD: square 660Hz (แยกจาก ER 880Hz และ Null 440Hz)
function playIPDBeep() {
  try {
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.value = 660
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.7)
  } catch {}
}

export function useIPDOrder() {
  const [orders, setOrders] = useState<IPDOrderAlert[]>([])
  const [connected, setConnected] = useState(false)
  const [soundOn, setSoundOn] = useState(false)

  const localMap = useRef<Map<string, IPDOrderAlert>>(new Map())
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
    if (next && localMap.current.size > 0) {
      playIPDBeep()
      beepRef.current = setInterval(playIPDBeep, 3000)
    } else {
      if (beepRef.current) clearInterval(beepRef.current)
      beepRef.current = null
    }
  }

  function sync(map: Map<string, IPDOrderAlert>) {
    const list = Array.from(map.values())
    setOrders(list)
    if (!soundOnRef.current) return
    if (list.length > 0 && !beepRef.current) {
      playIPDBeep()
      beepRef.current = setInterval(playIPDBeep, 3000)
    } else if (list.length === 0 && beepRef.current) {
      clearInterval(beepRef.current)
      beepRef.current = null
    }
  }

  useEffect(() => {
    const url = API_ENDPOINTS.IPD.ORDERS_SSE
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
          const list: IPDOrderAlert[] | null = JSON.parse(e.data)
          // snapshot: [] → ลบทันที
          const newMap = new Map<string, IPDOrderAlert>()
          if (list && list.length > 0) {
            list.forEach((o) => newMap.set(o.an, o))
          }
          localMap.current = newMap
          sync(localMap.current)
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

  return { orders, connected, soundOn, toggleSound }
}
