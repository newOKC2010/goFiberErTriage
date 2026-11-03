'use client'
import { useIPDOrder } from './useIPDOrder'
import IPDOrderCard from './IPDOrderCard'

export default function DoctorOrderIPDPage() {
  const { orders, connected, soundOn, toggleSound } = useIPDOrder()

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-5xl text-blue-700">IPD Doctor Order</h1>
          <p className="mt-1 text-2xl text-gray-500">
            รอ Approve Order วันนี้ ({orders.length} รายการ)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`rounded-full px-4 py-1 text-xl text-white ${connected ? 'bg-green-500' : 'bg-red-500'}`}>
            {connected ? '● เชื่อมต่อแล้ว' : '● ไม่ได้เชื่อมต่อ'}
          </span>
          <button
            onClick={toggleSound}
            className={`rounded-xl px-6 py-3 text-2xl text-white shadow ${soundOn ? 'bg-red-500' : 'bg-blue-500'}`}
          >
            {soundOn ? '🔕 ปิดเสียง' : '🔔 เปิดเสียง'}
          </button>
        </div>
      </div>

      {/* Cards */}
      {orders.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-white shadow">
          <p className="text-3xl text-gray-400">ไม่มี order ที่รอ approve</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <IPDOrderCard key={o.an} order={o} />
          ))}
        </div>
      )}
    </main>
  )
}
