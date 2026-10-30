// Search input component สำหรับ dropdown
interface SearchInputProps {
  searchTerm: string
  onChange: (term: string) => void
  isMobile: boolean
}

export default function SearchInput({ searchTerm, onChange, isMobile }: SearchInputProps) {
  // แสดงเฉพาะใน desktop
  if (isMobile) return null

  return (
    <div className="p-3 border-b border-gray-100">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ค้นหา..."
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   font-bold touch-manipulation"
        style={{ touchAction: 'manipulation' }}
        autoFocus
      />
    </div>
  )
}