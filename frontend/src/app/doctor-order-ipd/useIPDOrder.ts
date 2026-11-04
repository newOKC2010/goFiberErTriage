'use client'
import { useEffect, useRef, useState } from 'react'
import { API_ENDPOINTS } from '@/global/globalApi'
import { IPDOrderAlert, IPDOrderGroup } from './TYPE'
import { getAudioCtx } from '@/app/triage/audio'

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

function groupOrders(list: IPDOrderAlert[]): IPDOrderGroup[] {
  const map = new Map<string, IPDOrderGroup>()
  for (const o of list) {
    if (!map.has(o.order_id)) {
      map.set(o.order_id, {
        order_id: o.order_id,
        an: o.an,
        hn: o.hn,
        full_name: o.full_name,
        doctor_name: o.doctor_name,
        order_date: o.order_date,
        details: [],
      })
    }
    map.get(o.order_id)!.details.push({
      detail_id: o.detail_id,
      order_type: o.order_type,
      order_text: o.order_text,
      order_time: o.order_time,
    })
  }
  return Array.from(map.values())
}

export function useIPDOrder() {
  const [groups, setGroups] = useState<IPDOrderGroup[]>([])
  const [connected, setConnected] = useState(false)
  const [soundOn, setSoundOn] = useState(false)

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
    if (next && groups.length > 0) {
      playIPDBeep()
      beepRef.current = setInterval(playIPDBeep, 3000)
    } else {
      if (beepRef.current) clearInterval(beepRef.current)
      beepRef.current = null
    }
  }

  function sync(grouped: IPDOrderGroup[]) {
    setGroups(grouped)
    if (!soundOnRef.current) return
    if (grouped.length > 0 && !beepRef.current) {
      playIPDBeep()
      beepRef.current = setInterval(playIPDBeep, 3000)
    } else if (grouped.length === 0 && beepRef.current) {
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
          sync(groupOrders(list ?? []))
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

  return { groups, connected, soundOn, toggleSound }
}
