import { ERAlert, EMERGENCY_COLOR } from './TYPE'

export default function ERAlertCard({ alert, onClear }: { alert: ERAlert; onClear: (vn: string) => void }) {
  const color = EMERGENCY_COLOR[alert.emergency_type] ?? {
    bg: 'bg-gray-50', border: 'border-gray-400', badge: 'bg-gray-400',
  }

  return (
    <div className={`rounded-xl border-l-4 px-4 py-3 shadow-md ${color.bg} ${color.border}`}>
      <div className="flex items-center justify-between gap-3">
        {/* ซ้าย: ชื่อ + HN + type */}
        <div className="flex flex-col gap-0.5">
          <span className={`w-fit rounded-full px-3 py-0.5 text-xs font-bold text-white ${color.badge}`}>
            {alert.emergency_name}
          </span>
          <p className="text-xl font-bold text-gray-900">{alert.full_name}</p>
          <p className="text-sm text-gray-500">HN: {alert.hn} &nbsp;|&nbsp; เข้า ER: {alert.enter_er_date} {alert.enter_er_time}</p>
        </div>

        {/* ขวา: เวลารอ + ปุ่มเคลียร์ */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <span className="text-4xl font-black text-red-600 leading-none">{alert.elapsed_min}</span>
          <span className="text-sm text-gray-500">นาที</span>
          <span className="text-xs text-gray-400">แจ้งทุก {alert.threshold_min} นาที</span>
          <button
            onClick={() => onClear(alert.vn)}
            className="cursor-pointer rounded-lg bg-red-500 px-4 py-1.5 text-sm font-bold text-white shadow-md transition-all hover:bg-red-600 hover:shadow-lg active:scale-95"
          >
            เคลียร์
          </button>
        </div>
      </div>
    </div>
  )
}
