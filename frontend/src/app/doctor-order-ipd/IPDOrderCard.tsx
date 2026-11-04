import { IPDOrderGroup } from './TYPE'

export default function IPDOrderCard({ group }: { group: IPDOrderGroup }) {
  return (
    <div className="rounded-2xl border-l-8 border-blue-500 bg-blue-50 px-8 py-6 shadow-md">
      <div className="flex flex-col gap-2">
        <p className="text-4xl text-gray-900">{group.full_name}</p>
        <p className="text-2xl text-gray-600">
          HN: {group.hn} &nbsp;|&nbsp; AN: {group.an}
        </p>
        <p className="text-2xl text-blue-700">
          สั่ง ORDER โดย แพทย์: {group.doctor_name}
        </p>
        <p className="text-xl text-gray-400">วันที่ ORDER: {group.order_date}</p>

        {/* รายการ detail */}
        <div className="mt-2 flex flex-col gap-1 border-t border-blue-200 pt-2">
          {group.details.map((d, i) => (
            <div key={d.detail_id} className="flex items-start gap-3 text-xl">
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
    </div>
  )
}
