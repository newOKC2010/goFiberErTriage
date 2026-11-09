import { NullTypeAlert } from './TYPE'

export default function NullTypeCard({ alert }: { alert: NullTypeAlert }) {
  return (
    <div className="rounded-xl border-l-4 border-orange-400 bg-orange-50 px-4 py-3 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="w-fit rounded-full bg-orange-400 px-3 py-0.5 text-xs font-bold text-white">
            ยังไม่ระบุ Type
          </span>
          <p className="text-xl font-bold text-gray-900">{alert.full_name}</p>
          <p className="text-sm text-gray-500">
            HN: {alert.hn} &nbsp;|&nbsp; เข้า ER: {alert.enter_er_date} {alert.enter_er_time}
          </p>
        </div>
        <div className="flex flex-col items-center shrink-0">
          <span className="text-4xl font-black text-orange-500 leading-none">{alert.elapsed_min}</span>
          <span className="text-sm text-gray-500">นาที</span>
        </div>
      </div>
    </div>
  )
}
