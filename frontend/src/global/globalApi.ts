export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const API_ENDPOINTS = {
  ER: {
    get ALERTS_SSE() { return `${process.env.NEXT_PUBLIC_API_URL}/api/er/alerts` },
    get NULL_TYPE_SSE() { return `${process.env.NEXT_PUBLIC_API_URL}/api/er/null-type` },
  },
  IPD: {
    get ORDERS_SSE() { return `${process.env.NEXT_PUBLIC_API_URL}/api/ipd/orders` },
  },
}
