import { Component, OnInit } from '@angular/core';
import { ChartData, ChartType, ChartOptions } from 'chart.js';
import { TransactionService } from '../core/services/transaction.service';
import { Transaction } from '../models/transaction';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  transactions: Transaction[] = [];

  pieChartType: ChartType = 'pie';
  pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: []
  };

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  barChartOptions: ChartOptions = {
    responsive: true,
  };

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.transactions = this.transactionService.getTransactions();
    this.generateCategoryChart();
    this.generateMonthlyChart();
  }

  // 📊 Répartition par catégorie
  generateCategoryChart() {
    const totals: { [key: string]: number } = {};
    this.transactions.filter(t => t.type === 'expense').forEach(tx => {
      totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
    });

    this.pieChartData = {
      labels: Object.keys(totals),
      datasets: [{
        data: Object.values(totals),
        backgroundColor: this.generateColors(Object.keys(totals).length)
      }]
    };
  }

  // 📊 Revenus vs Dépenses par mois
  generateMonthlyChart() {
    const revenus: { [mois: string]: number } = {};
    const depenses: { [mois: string]: number } = {};

    for (let tx of this.transactions) {
      const date = new Date(tx.date);
      const mois = date.toLocaleString('fr-FR', { month: 'short' }) + ' ' + date.getFullYear();

      if (tx.type === 'income') {
        revenus[mois] = (revenus[mois] || 0) + tx.amount;
      } else {
        depenses[mois] = (depenses[mois] || 0) + tx.amount;
      }
    }

    const allMonths = Array.from(new Set([...Object.keys(revenus), ...Object.keys(depenses)]));

    this.barChartData = {
      labels: allMonths,
      datasets: [
        {
          label: 'Revenus',
          data: allMonths.map(m => revenus[m] || 0),
          backgroundColor: '#4CAF50'
        },
        {
          label: 'Dépenses',
          data: allMonths.map(m => depenses[m] || 0),
          backgroundColor: '#F44336'
        }
      ]
    };
  }

  // Générer des couleurs dynamiques
  generateColors(count: number): string[] {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    return Array(count).fill('').map((_, idx) => colors[idx % colors.length]);
  }
}
