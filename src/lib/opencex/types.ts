export type OrderSide = "BUY" | "SELL"
export type OrderType = "LIMIT" | "MARKET" | "IOC" | "FOK" | "POST_ONLY"
export type OrderStatus = "OPEN" | "FILLED" | "PARTIAL" | "CANCELLED" | "REJECTED"

export interface Order {
  id: string
  userId: string
  pair: string
  side: OrderSide
  type: OrderType
  price: number
  quantity: number
  filled: number
  status: OrderStatus
  createdAt: number
  updatedAt: number
}

export interface Trade {
  id: string
  pair: string
  price: number
  quantity: number
  side: OrderSide
  buyerOrderId: string
  sellerOrderId: string
  timestamp: number
}

export interface OrderBookLevel {
  price: number
  quantity: number
  orderCount: number
}

export interface OrderBook {
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  sequence: number
}
