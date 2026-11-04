'use client'
import { useMemo, useState } from 'react'
import { useIPDOrder } from './useIPDOrder'
import IPDOrderCard from './IPDOrderCard'
import { API_ENDPOINTS } from '@/global/globalApi'
import { IPDOrderAlert, IPDOrderGroup } from './TYPE'
import Dropdown from '@/components/dropdown/mainDropdown'
import { Button } from '@/components/buttonClick/mainButton'
import Loading from '@/components/loading/mainLoading'
import { DropdownOption } from '@/components/dropdown/handler/TYPE'

function groupOrders(list: IPDOrderAlert[]): IPDOrderGroup[] {
  const map = new Map<string, IPDOrderGroup>()
  for (const o of list) {
    if (!map.has(o.order_id)) {
      map.set(o.order_id, {
        order_id: o.order_id, an: o.an, hn: o.hn,
        full_name: o.full_name, doctor_name: o.doctor_name,
        order_date: o.order_date, details: [],
      })
    }
    map.get(o.order_id)!.details.push({
      detail_id: o.detail_id, order_type: o.order_type,
      order_text: o.order_text, order_time: o.order_time,
    })
  }
  return Array.from(map.values())
}

const SORT_OPTIONS: DropdownOption[] = [
  { value: 'asc', label: 'เวลา น้อย → มาก' },
  { value: 'desc', label: 'เวลา มาก → น้อย' },
]

const DAYS_OPTIONS: DropdownOption[] = [
  { value: '1', label: 'ย้อนหลัง 1 วัน' },
  { value: '3', label: 'ย้อนหลัง 3 วัน' },
  { value: '7', label: 'ย้อนหลัง 7 วัน' },
]

type Applied = { doctor: string; sort: string; days: string }

export default function DoctorOrderIPDPage() {
  const { groups: liveGroups = [], connected, soundOn, toggleSound } = useIPDOrder()

  // ค่าที่เลือกใน dropdown (ยังไม่ทำงานจนกว่าจะกดค้นหา)
  const [doctorSel, setDoctorSel] = useState('')
  const [sortSel, setSortSel] = useState('asc')
  const [daysSel, setDaysSel] = useState('')

  // เงื่อนไขที่กดค้นหาแล้ว (null = โหมด real-time ไม่กรองอะไร)
  const [applied, setApplied] = useState<Applied | null>(null)
  const [historyGroups, setHistoryGroups] = useState<IPDOrderGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const isHistoryMode = applied !== null && applied.days !== ''

  const doctorOptions: DropdownOption[] = useMemo(() => {
    const src = isHistoryMode ? historyGroups : liveGroups
    const s = new Set(src.map(g => g.doctor_name).filter(Boolean))
    return [{ value: '', label: 'ทั้งหมด' }, ...Array.from(s).sort().map(d => ({ value: d, label: d }))]
  }, [liveGroups, historyGroups, isHistoryMode])

  // แสดงผล: ถ้ายังไม่กดค้นหา = real-time ทั้งหมด / กดแล้ว = กรอง 3 เงื่อนไขพร้อมกัน
  const displayGroups = useMemo(() => {
    const source = isHistoryMode ? historyGroups : liveGroups
    if (!applied) return source
    let g = applied.doctor ? source.filter(x => x.doctor_name === applied.doctor) : source
    return [...g].sort((a, b) => {
      const ta = `${a.order_date} ${a.details[0]?.order_time ?? ''}`
      const tb = `${b.order_date} ${b.details[0]?.order_time ?? ''}`
      return applied.sort === 'asc' ? ta.localeCompare(tb) : tb.localeCompare(ta)
    })
  }, [liveGroups, historyGroups, applied, isHistoryMode])

  async function handleSearch() {
    setErrorMsg('')
    if (daysSel) {
      setLoading(true)
      try {
        const res = await fetch(API_ENDPOINTS.IPD.ORDERS_HISTORY(Number(daysSel)))
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const list: IPDOrderAlert[] = await res.json()
        setHistoryGroups(groupOrders(list))
      } catch (e) {
        setErrorMsg(`โหลดข้อมูลไม่สำเร็จ: ${e}`)
        setLoading(false)
        return
      }
      setLoading(false)
    } else {
      setHistoryGroups([])
    }
    setApplied({ doctor: doctorSel, sort: sortSel, days: daysSel })
  }

  function handleClear() {
    setApplied(null)
    setHistoryGroups([])
    setDoctorSel('')
    setSortSel('asc')
    setDaysSel('')
    setErrorMsg('')
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl text-blue-700">IPD Doctor Order</h1>
          <p className="mt-1 text-2xl text-gray-500">
            {applied
              ? `ผลค้นหา${applied.days ? ` ย้อนหลัง ${applied.days} วัน` : ' วันนี้'}${applied.doctor ? ` | ${applied.doctor}` : ''}`
              : 'real-time วันนี้'}{' '}
            ({displayGroups.length} รายการ)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-4 py-1 text-xl text-white ${connected ? 'bg-green-500' : 'bg-red-500'}`}>
            {connected ? '● เชื่อมต่อ' : '● ไม่เชื่อมต่อ'}
          </span>
          <Button variant={soundOn ? 'danger' : 'primary'} size="lg" onClick={toggleSound}>
            {soundOn ? 'ปิดเสียง' : 'เปิดเสียง'}
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-end gap-4 rounded-2xl bg-white p-4 shadow">
        <Dropdown
          label="แพทย์"
          options={doctorOptions}
          value={doctorSel}
          onChange={setDoctorSel}
          placeholder="-- ทั้งหมด --"
          searchable
          className="min-w-[320px]"
        />
        <Dropdown
          label="เรียงเวลา"
          options={SORT_OPTIONS}
          value={sortSel}
          onChange={setSortSel}
        />
        <Dropdown
          label="ย้อนหลัง"
          options={DAYS_OPTIONS}
          value={daysSel}
          onChange={setDaysSel}
          placeholder="-- ไม่เลือก (วันนี้) --"
        />
        <Button variant="primary" size="lg" loading={loading} onClick={handleSearch} icon="search">
          ค้นหา
        </Button>
        <Button variant="secondary" size="lg" onClick={handleClear} icon="refresh">
          ล้างค่า (real-time)
        </Button>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-xl text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Loading */}
      {loading && <Loading fullScreen={false} size="md" message="กำลังโหลดข้อมูล" />}

      {/* Cards */}
      {!loading && displayGroups.length === 0 && (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-white shadow">
          <p className="text-3xl text-gray-400">
            {applied ? 'ไม่พบข้อมูลตามเงื่อนไขที่เลือก' : 'ไม่มี order ที่รอ'}
          </p>
        </div>
      )}

      {!loading && displayGroups.length > 0 && (
        <div className="flex flex-col gap-4">
          {displayGroups.map(g => <IPDOrderCard key={g.order_id} group={g} />)}
        </div>
      )}
    </main>
  )
}
