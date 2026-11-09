'use client'
import { useERAlert } from './useERAlert'
import { useNullTypeAlert } from './useNullTypeAlert'
import ERAlertCard from './ERAlertCard'
import NullTypeCard from './NullTypeCard'

function SpeakerOnIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 10v4h4l5 5V5L7 10H3z" />
      <path d="M16.5 12a4.5 4.5 0 00-2.5-4.03v8.05A4.5 4.5 0 0016.5 12z" />
      <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}

function SpeakerOffIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 10v4h4l5 5V5L7 10H3z" />
      <path d="M19.07 4.93l-1.41 1.41L20.24 9l-2.58 2.59 1.41 1.41L21.66 10.41 24.24 13l1.41-1.41L23.07 9l2.58-2.59-1.41-1.41L21.66 7.59 19.07 4.93z" transform="translate(-4 2) scale(0.9)" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21l3.5-4.67A5.98 5.98 0 0012 15c-1.3 0-2.5.41-3.5 1.33L12 21z" />
      <path d="M12 9c-2.97 0-5.66 1.08-7.76 2.86l1.8 2.4A8.95 8.95 0 0112 12c2.25 0 4.31.83 5.96 2.26l1.8-2.4A11.93 11.93 0 0012 9z" />
      <path d="M12 3C7.46 3 3.34 4.69.12 7.46l1.8 2.4A14.9 14.9 0 0112 6c3.84 0 7.36 1.44 10.08 3.86l1.8-2.4A17.9 17.9 0 0012 3z" />
    </svg>
  )
}

function WarnIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z" />
    </svg>
  )
}

export default function TriagePage() {
  const { alerts, connected, soundOn, toggleSound } = useERAlert()
  const { alerts: nullAlerts, soundOn: nullSoundOn, toggleSound: toggleNullSound } = useNullTypeAlert()

  const visibleAlerts = alerts.slice(0, 10)
  const visibleNull = nullAlerts.slice(0, 10)

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">ER Triage Monitor</h1>
          <p className="text-sm text-gray-500">ผู้ป่วยรอแพทย์เกินกำหนด</p>
        </div>
        <div className="flex items-center gap-2">
          {/* ปุ่มเสียง ER */}
          <button
            onClick={toggleSound}
            className={`flex flex-col items-center rounded-xl px-4 py-1.5 text-white transition-colors ${soundOn ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'}`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              {soundOn
                ? <><path d="M3 10v4h4l5 5V5L7 10H3z" /><path d="M16.5 12a4.5 4.5 0 00-2.5-4.03v8.05A4.5 4.5 0 0016.5 12z" /><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></>
                : <><path d="M3 10v4h4l5 5V5L7 10H3z" /><path d="M19.07 4.93l-1.41 1.41L20.24 9l-2.58 2.59 1.41 1.41L21.66 10.41 24.24 13l1.41-1.41L23.07 9l2.58-2.59-1.41-1.41L21.66 7.59 19.07 4.93z" transform="translate(-4 2) scale(0.9)" /></>
              }
            </svg>
            <span className="text-xs font-bold">เสียง ER</span>
            <span className="text-xs">{soundOn ? '● เปิดอยู่' : '○ ปิดอยู่'}</span>
          </button>

          {/* ปุ่มเสียง Null */}
          <button
            onClick={toggleNullSound}
            className={`flex flex-col items-center rounded-xl px-4 py-1.5 text-white transition-colors ${nullSoundOn ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'}`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              {nullSoundOn
                ? <><path d="M3 10v4h4l5 5V5L7 10H3z" /><path d="M16.5 12a4.5 4.5 0 00-2.5-4.03v8.05A4.5 4.5 0 0016.5 12z" /><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></>
                : <><path d="M3 10v4h4l5 5V5L7 10H3z" /><path d="M19.07 4.93l-1.41 1.41L20.24 9l-2.58 2.59 1.41 1.41L21.66 10.41 24.24 13l1.41-1.41L23.07 9l2.58-2.59-1.41-1.41L21.66 7.59 19.07 4.93z" transform="translate(-4 2) scale(0.9)" /></>
              }
            </svg>
            <span className="text-xs font-bold">เสียง ไม่ระบุ Type</span>
            <span className="text-xs">{nullSoundOn ? '● เปิดอยู่' : '○ ปิดอยู่'}</span>
          </button>

          {/* สถานะการเชื่อมต่อ */}
          <div className={`flex flex-col items-center rounded-xl px-4 py-1.5 text-white ${connected ? 'bg-blue-500' : 'bg-red-400'}`}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              {connected
                ? <><path d="M12 21l3.5-4.67A5.98 5.98 0 0012 15c-1.3 0-2.5.41-3.5 1.33L12 21z" /><path d="M12 9c-2.97 0-5.66 1.08-7.76 2.86l1.8 2.4A8.95 8.95 0 0112 12c2.25 0 4.31.83 5.96 2.26l1.8-2.4A11.93 11.93 0 0012 9z" /><path d="M12 3C7.46 3 3.34 4.69.12 7.46l1.8 2.4A14.9 14.9 0 0112 6c3.84 0 7.36 1.44 10.08 3.86l1.8-2.4A17.9 17.9 0 0012 3z" /></>
                : <path d="M12 2L1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z" />
              }
            </svg>
            <span className="text-xs font-bold">{connected ? 'เชื่อมต่อแล้ว' : 'ขาดการเชื่อมต่อ'}</span>
          </div>
        </div>
      </div>

      {/* แบ่ง 2 คอลัมน์ */}
      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-100px)]">

        {/* ซ้าย: ผู้ป่วยที่มี type */}
        <div className="flex flex-col gap-2 overflow-y-auto">
          <div className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2">
            <h2 className="text-base font-bold text-white">🚨 ER Alert</h2>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-sm font-bold text-red-600">
              {alerts.length} ราย
            </span>
          </div>
          {visibleAlerts.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl bg-white shadow-sm">
              <p className="text-xl text-gray-400">ไม่มีผู้ป่วยรอแพทย์เกินกำหนด</p>
            </div>
          ) : (
            visibleAlerts.map((a) => (
              <ERAlertCard key={`${a.vn}-${a.elapsed_min}`} alert={a} />
            ))
          )}
        </div>

        {/* ขวา: ผู้ป่วยที่ยังไม่ระบุ type */}
        <div className="flex flex-col gap-2 overflow-y-auto">
          <div className="flex items-center gap-2 rounded-xl bg-orange-400 px-4 py-2">
            <h2 className="text-base font-bold text-white">⚠️ ยังไม่ระบุ Type ER</h2>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-sm font-bold text-orange-600">
              {nullAlerts.length} ราย
            </span>
          </div>
          {visibleNull.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl bg-white shadow-sm">
              <p className="text-xl text-gray-400">ไม่มีผู้ป่วยที่ยังไม่ระบุ Type</p>
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
