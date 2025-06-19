export const operationTypeLabels: Record<string, string> = {
  ENTRY: 'Entrada',
  EXIT: 'Saida',
} as const

export type OperationType = keyof typeof operationTypeLabels
