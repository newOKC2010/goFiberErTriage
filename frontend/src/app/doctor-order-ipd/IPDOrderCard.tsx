import { IPDOrderGroup } from './TYPE'

export default function IPDOrderCard({ group, onClick }: { group: IPDOrderGroup; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative rounded-xl border-l-4 border-blue-500 bg-blue-50 px-4 py-3 text-left shadow-md transition-all hover:scale-[1.02] hover:bg-blue-100 hover:shadow-lg cursor-pointer"
    >
      <span className="absolute right-2 top-2 rounded-full bg-blue-500 px-2 py-0.5 text-sm font-bold text-white">
        {group.details.length}
      </span>
      <p className="truncate text-lg font-bold text-gray-900">{group.full_name}</p>
      <p className="text-sm font-bold text-gray-600">
        HN: {group.hn} | AN: {group.an}
      </p>
      <p className="truncate text-sm font-bold text-blue-700">
        สั่ง ORDER โดย แพทย์: {group.doctor_name}
      </p>
      <p className="text-sm font-bold text-gray-400">วันที่ ORDER: {group.order_date}</p>
      {group.details[0]?.order_time && (
        <p className="text-sm font-bold text-red-500">เวลา: {group.details[0].order_time}</p>
      )}
    </button>
  )
}
