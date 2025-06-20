export type OperationType = 'ENTRY' | 'EXIT'

/** Enviado pelo front (POST) */
export interface StockMovementCreate {
  productId: string
  operationType: OperationType
  salePrice: number
  saleDate: string // "yyyy-MM-ddTHH:mm:ss"
  movementQuantity: number
  customerId?: string
  supplierId?: string
}

/** Recebido do back */
export interface StockMovement extends StockMovementCreate {
  stockMovementId: string
  productCode: string
}
