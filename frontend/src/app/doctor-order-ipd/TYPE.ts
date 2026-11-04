export interface IPDOrderAlert {
  detail_id: string
  order_id: string
  an: string
  order_date: string
  order_time: string
  order_type: string
  order_text: string
  doctor_name: string
  hn: string
  full_name: string
}

export interface IPDOrderDetail {
  detail_id: string
  order_type: string
  order_text: string
  order_time: string
}

export interface IPDOrderGroup {
  order_id: string
  an: string
  hn: string
  full_name: string
  doctor_name: string
  order_date: string
  details: IPDOrderDetail[]
}
