// product-types.ts
export const productTypeLabels: Record<string, string> = {
  ELETRONIC: 'Eletrônico',
  HOME_APPLIANCE: 'Eletrodoméstico',
  FURNITURE: 'Móvel',
} as const

export type ProductType = keyof typeof productTypeLabels
