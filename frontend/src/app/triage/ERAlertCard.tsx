import { ERAlert, EMERGENCY_COLOR } from './TYPE'

export default function ERAlertCard({ alert }: { alert: ERAlert }) {
  const color = EMERGENCY_COLOR[alert.emergency_type] ?? {
    bg: 'bg-gray-50', border: 'border-gray-400', badge: 'bg-gray-400',
  }

  return (
    <div className={`rounded-2xl border-l-8 px-8 py-6 shadow-md ${color.bg} ${color.border}`}>
      <div className="flex items-center justify-between gap-4">
        {/* ซ้าย: ชื่อ + HN + type */}
        <div className="flex flex-col gap-1">
          <span className={`w-fit rounded-full px-4 py-1 text-xl text-white ${color.badge}`}>
            {alert.emergency_name}
          </span>
          <p className="text-4xl text-gray-900">{alert.full_name}</p>
          <p className="text-2xl text-gray-500">HN: {alert.hn} &nbsp;|&nbsp; เข้า ER: {alert.enter_er_date} {alert.enter_er_time}</p>
        </div>

        {/* ขวา: เวลารอ */}
        <div className="flex flex-col items-center shrink-0">
          <span className="text-7xl font-black text-red-600 leading-none">{alert.elapsed_min}</span>
          <span className="text-2xl text-gray-500">นาที</span>
          <span className="mt-1 text-lg text-gray-400">แจ้งทุก {alert.threshold_min} นาที</span>
        </div>
      </div>
    </div>
  )
}
