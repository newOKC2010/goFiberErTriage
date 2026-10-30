import { NullTypeAlert } from './TYPE'

export default function NullTypeCard({ alert }: { alert: NullTypeAlert }) {
  return (
    <div className="rounded-2xl border-l-8 border-gray-400 bg-gray-50 px-8 py-6 shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="w-fit rounded-full bg-gray-500 px-4 py-1 text-xl text-white">
            ยังไม่ระบุ Type
          </span>
          <p className="text-4xl text-gray-900">{alert.full_name}</p>
          <p className="text-2xl text-gray-500">
            HN: {alert.hn} &nbsp;|&nbsp; เข้า ER: {alert.enter_er_date} {alert.enter_er_time}
          </p>
        </div>

      </div>
    </div>
  )
}
