export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const API_ENDPOINTS = {
  ER: {
    get ALERTS_SSE() { return `${process.env.NEXT_PUBLIC_API_URL}/api/er/alerts` },
    get NULL_TYPE_SSE() { return `${process.env.NEXT_PUBLIC_API_URL}/api/er/null-type` },
    CLEAR(vn: string) { return `${process.env.NEXT_PUBLIC_API_URL}/api/er/alerts/${vn}/clear` },
  },
  IPD: {
    get ORDERS_SSE() { return `${process.env.NEXT_PUBLIC_API_URL}/api/ipd/orders` },
    ORDERS_HISTORY(days: number) { return `${process.env.NEXT_PUBLIC_API_URL}/api/ipd/orders/history?days=${days}` },
  },
}
