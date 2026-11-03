import { IPDOrderAlert } from './TYPE'

export default function IPDOrderCard({ order }: { order: IPDOrderAlert }) {
  return (
    <div className="rounded-2xl border-l-8 border-blue-500 bg-blue-50 px-8 py-6 shadow-md">
      <div className="flex flex-col gap-2">
        <p className="text-4xl text-gray-900">{order.full_name}</p>
        <p className="text-2xl text-gray-600">
          HN: {order.hn} &nbsp;|&nbsp; AN: {order.an}
        </p>
        <p className="text-2xl text-blue-700">
          สั่ง ORDER โดย แพทย์: {order.doctor_name}
        </p>
        <p className="text-xl text-gray-500">
          วันเวลาที่ แพทย์ ORDER : {order.order_date} {order.order_time}
        </p>
      </div>
    </div>
  )
}
