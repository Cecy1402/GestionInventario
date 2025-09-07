export enum TransactionType {
  Compra = 0,
  Venta = 1
}

export interface TransactionTypeConfig {
  id: number;        
  name: string;      
}

export const TRANSACTION_TYPE_CONFIG: Record<TransactionType, TransactionTypeConfig> = {
  [TransactionType.Compra]: {
    id: 1, 
    name: 'Compra'  
  },
  [TransactionType.Venta]: {
    id: 2, 
    name: 'Venta' 
  }
};
  
export interface Transaction {
  id: number;
  transactionDate: Date;
  tipo: TransactionType;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  detail: string;
  productImage: string; 
}
