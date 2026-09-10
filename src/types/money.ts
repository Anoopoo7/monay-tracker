export interface Category {
  id: string;
  name: string;
  budget: number;
  createdAt: string;
}

export interface MoneySource {
  id: string;
  name: string;
  initialAmount: number;
  createdAt: string;
}

export interface Spend {
  id: string;
  amount: number;
  categoryId: string;
  sourceId: string;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
}

export interface Transfer {
  id: string;
  fromSourceId: string;
  toSourceId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
}

export interface AppData {
  categories: Category[];
  sources: MoneySource[];
  spends: Spend[];
  transfers?: Transfer[];
}

export type CategoryStatus = 'normal' | 'warning' | 'exceeded';
