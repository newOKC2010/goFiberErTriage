'use client'
import { useERAlert } from './useERAlert'
import { useNullTypeAlert } from './useNullTypeAlert'
import ERAlertCard from './ERAlertCard'
import NullTypeCard from './NullTypeCard'

export default function TriagePage() {
  const { alerts, connected, soundOn, toggleSound } = useERAlert()
  const { alerts: nullAlerts, soundOn: nullSoundOn, toggleSound: toggleNullSound } = useNullTypeAlert()

  const visibleAlerts = alerts.slice(0, 10)
  const visibleNull = nullAlerts.slice(0, 10)

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-4xl text-gray-800">ER Triage Monitor</h1>
          <p className="text-xl text-gray-500">ผู้ป่วยรอแพทย์เกินกำหนด</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSound}
            className={`rounded-xl px-5 py-2 text-xl text-white ${soundOn ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {soundOn ? '🔕 ปิดเสียง' : '🔔 เปิดเสียง'}
          </button>
          <button
            onClick={toggleNullSound}
            className={`rounded-xl px-5 py-2 text-xl text-white ${nullSoundOn ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'}`}
          >
            {nullSoundOn ? '🔕 ปิดเสียง (null)' : '🔔 เปิดเสียง (null)'}
          </button>
          <div className="flex items-center gap-2">
            <span className={`h-4 w-4 rounded-full ${connected ? 'bg-green-500' : 'bg-red-400'}`} />
            <span className="text-xl text-gray-500">{connected ? 'เชื่อมต่อแล้ว' : 'ขาดการเชื่อมต่อ'}</span>
          </div>
        </div>
      </div>

      {/* แบ่ง 2 คอลัมน์ */}
      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-120px)]">

        {/* ซ้าย: ผู้ป่วยที่มี type */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl text-gray-700">ER Alert</h2>
            {alerts.length > 0 && (
              <span className="rounded-full bg-red-500 px-3 py-0.5 text-lg text-white">{alerts.length}</span>
            )}
          </div>
          {visibleAlerts.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl bg-white shadow-sm">
              <p className="text-2xl text-gray-400">ไม่มีผู้ป่วยรอแพทย์เกินกำหนด</p>
            </div>
          ) : (
            visibleAlerts.map((a) => (
              <ERAlertCard key={`${a.vn}-${a.elapsed_min}`} alert={a} />
            ))
          )}
        </div>

        {/* ขวา: ผู้ป่วยที่ยังไม่ระบุ type */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl text-gray-700">ผู้ป่วยยังไม่ระบุ Type ER (Emergency)</h2>
            {nullAlerts.length > 0 && (
              <span className="rounded-full bg-gray-500 px-3 py-0.5 text-lg text-white">{nullAlerts.length}</span>
            )}
          </div>
          {visibleNull.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl bg-white shadow-sm">
              <p className="text-2xl text-gray-400">ไม่มีผู้ป่วยที่ยังไม่ระบุ Type</p>
            </div>
          ) : (
            visibleNull.map((a) => (
              <NullTypeCard key={`${a.vn}-${a.elapsed_min}`} alert={a} />
            ))
          )}
        </div>

      </div>
    </div>
  )
}
