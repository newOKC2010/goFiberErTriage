export interface ERAlert {
  hn: string
  vn: string
  full_name: string
  emergency_type: number
  emergency_name: string
  enter_er_date: string
  enter_er_time: string
  elapsed_min: number
  threshold_min: number
  message: string
}

export interface NullTypeAlert {
  hn: string
  vn: string
  full_name: string
  enter_er_date: string
  enter_er_time: string
  elapsed_min: number
  message: string
}

export const EMERGENCY_COLOR: Record<number, { bg: string; border: string; badge: string }> = {
  6: { bg: 'bg-red-50',    border: 'border-red-500',    badge: 'bg-red-500'    }, // 1_Resuscitation
  1: { bg: 'bg-orange-50', border: 'border-orange-500', badge: 'bg-orange-500' }, // 2_Emergency
  2: { bg: 'bg-yellow-50', border: 'border-yellow-500', badge: 'bg-yellow-500' }, // 3_Urgency
  7: { bg: 'bg-green-50',  border: 'border-green-500',  badge: 'bg-green-500'  }, // 4_Semi_Urgency
  5: { bg: 'bg-blue-50',   border: 'border-blue-500',   badge: 'bg-blue-500'   }, // 5_Non_Urgency
}
