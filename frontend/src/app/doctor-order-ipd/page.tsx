'use client'
import { useEffect, useMemo, useState } from 'react'
import { Modal } from '@/components/modal/mainModal'
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
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<IPDOrderGroup | null>(null)

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

  // pagination 5 คอลัมน์ × 6 แถว = 30 ใบ/หน้า (clamp หน้าอัตโนมัติเมื่อข้อมูล real-time เปลี่ยน)
  const PAGE_SIZE = 30
  const totalPages = Math.max(1, Math.ceil(displayGroups.length / PAGE_SIZE))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])
  const pageGroups = displayGroups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // sync modal กับข้อมูลล่าสุด (ถ้า order หายจากระบบ ให้ปิด modal)
  useEffect(() => {
    if (!selected) return
    const latest = displayGroups.find(g => g.order_id === selected.order_id)
    if (!latest) setSelected(null)
    else if (latest !== selected) setSelected(latest)
  }, [displayGroups, selected])

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
    setPage(1)
  }

  function handleClear() {
    setApplied(null)
    setHistoryGroups([])
    setDoctorSel('')
    setSortSel('asc')
    setDaysSel('')
    setErrorMsg('')
    setPage(1)
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-bold text-blue-700">IPD Doctor Order</h1>
          {applied ? (
            <p className="text-base font-bold text-gray-500">
              {`ผลค้นหา${applied.days ? ` ย้อนหลัง ${applied.days} วัน` : ' วันนี้'}${applied.doctor ? ` | ${applied.doctor}` : ''}`}{' '}
              ({displayGroups.length} รายการ)
            </p>
          ) : (
            <p className="text-base font-bold text-red-500">
              real-time วันนี้ ({displayGroups.length} รายการ)
            </p>
          )}
          <span className="text-sm text-red-400 italic">— คลิกที่รายชื่อเพื่อดูรายละเอียดการสั่ง order แพทย์</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-bold text-white ${connected ? 'bg-green-500' : 'bg-red-500'}`}>
            {connected ? '● เชื่อมต่อ' : '● ไม่เชื่อมต่อ'}
          </span>
          <Button variant={soundOn ? 'danger' : 'primary'} size="sm" onClick={toggleSound}>
            {soundOn ? 'ปิดเสียง' : 'เปิดเสียง'}
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-3 flex flex-wrap items-end gap-3 rounded-xl bg-white px-3 py-2 shadow [&_button]:py-1.5 [&_button]:px-3 [&_button]:text-sm [&_label]:text-xs [&_label]:mb-1">
        <Dropdown
          label="แพทย์"
          options={doctorOptions}
          value={doctorSel}
          onChange={setDoctorSel}
          placeholder="-- ทั้งหมด --"
          searchable
          className="min-w-[220px]"
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
        <Button variant="primary" size="sm" loading={loading} onClick={handleSearch} icon="search">
          ค้นหา
        </Button>
        <Button variant="secondary" size="sm" onClick={handleClear} icon="refresh">
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
        <>
          {/* Grid 5 คอลัมน์ × 6 แถว */}
          <div className="grid grid-cols-5 gap-3">
            {pageGroups.map(g => (
              <IPDOrderCard key={g.order_id} group={g} onClick={() => setSelected(g)} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-2">
              <Button variant="secondary" size="md" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                ก่อนหน้า
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-11 w-11 rounded-lg text-lg font-bold transition-colors ${n === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 shadow hover:bg-blue-100'}`}
                >
                  {n}
                </button>
              ))}
              <Button variant="secondary" size="md" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                ถัดไป
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal รายละเอียด order */}
      <Modal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.full_name ?? ''}
        wrapperClassName="max-w-3xl"
      >
        {selected && (
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold text-gray-600">
              HN: {selected.hn} | AN: {selected.an}
            </p>
            <p className="text-lg font-bold text-blue-700">
              สั่ง ORDER โดย แพทย์: {selected.doctor_name}
            </p>
            <p className="text-lg font-bold text-gray-400">วันที่ ORDER: {selected.order_date}</p>

            <div className="mt-2 flex flex-col gap-2 border-t border-blue-200 pt-3">
              {selected.details.map((d, i) => (
                <div key={d.detail_id} className="flex items-start gap-3 text-base font-bold">
                  <span className="min-w-[2rem] text-blue-500">{i + 1}.</span>
                  <span className="rounded-full bg-blue-100 px-3 py-0.5 text-blue-700">
                    {d.order_type}
                  </span>
                  <span className="flex-1 text-gray-800">{d.order_text}</span>
                  <span className="text-gray-400">{d.order_time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </main>
  )
}
