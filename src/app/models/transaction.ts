export interface Transaction {
  id: string
  type: 'income' | 'expense'; // ✅ Corrigé
  category: string;
  amount: number;
  date: string;
  description: string
}
// custom.d.ts
declare module 'jspdf' {
  interface jsPDF {
    autoTable: any;
  }
}
