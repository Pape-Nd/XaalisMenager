import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartType, ChartData, ChartOptions } from 'chart.js';
import { TransactionService } from '../core/services/transaction.service';
import { Transaction } from '../models/transaction';
import { BudgetService } from '../core/services/budget.service';
import { Budget } from '../models/budget';
import { ChatbotComponent } from '../chatbot/chatbot.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  budgetTotal = 0;
  solde = 0;
  revenus = 0;
  depenses = 0;

  pieChartType: 'pie' = 'pie';
  pieChartData: ChartData<'pie', number[], string> = {
    labels: ['Revenus', 'Dépenses'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#00b386', '#ff3b30'],
        borderWidth: 0
      }
    ]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const value = tooltipItem.raw as number;
            return `${tooltipItem.label}: ${value.toLocaleString('fr-FR')} €`;
          }
        }
      },
      legend: {
        labels: {
          font: {
            weight: 'bold'
          }
        }
      }
    }
  };

  barChartType: 'bar' = 'bar';
  barChartLabels: string[] = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

  barChartData: ChartData<'bar', number[], string> = {
    labels: this.barChartLabels,
    datasets: [
      {
        label: 'Revenus',
        data: Array(12).fill(0),
        backgroundColor: '#00b386'
      },
      {
        label: 'Dépenses',
        data: Array(12).fill(0),
        backgroundColor: '#ff3b30'
      }
    ]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        labels: {
          font: {
            weight: 'bold'
          }
        }
      }
    }
  };

  budgets: Budget[] = [];
  depensesParCategorie: { [key: string]: number } = {};
  alertesDepassement: string[] = [];

  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService
  ) {}

  ngOnInit(): void {
    this.transactionService.transactions$.subscribe((transactions: Transaction[]) => {
      const revenus = transactions
        .filter(t => t.type === 'income')
        .reduce((total, t) => total + Number(t.amount), 0);

      const depenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((total, t) => total + Math.abs(Number(t.amount)), 0);

      this.revenus = revenus;
      this.depenses = depenses;
      this.solde = revenus - depenses;

      this.pieChartData.datasets[0].data = [revenus, depenses];

      const revenusMensuels = Array(12).fill(0);
      const depensesMensuelles = Array(12).fill(0);

      transactions.forEach(t => {
        const mois = new Date(t.date).getMonth();
        if (t.type === 'income') {
          revenusMensuels[mois] += Number(t.amount);
        } else {
          depensesMensuelles[mois] += Math.abs(Number(t.amount));
        }
      });

      this.barChartData.datasets[0].data = revenusMensuels;
      this.barChartData.datasets[1].data = depensesMensuelles;
    });

    // Suivi des budgets
    this.budgetService.budgets$.subscribe(budgets => {
      this.budgets = budgets;
      this.budgetTotal = budgets.reduce((total, b) => total + b.amount, 0);
      this.depensesParCategorie = {};
      this.alertesDepassement = [];

      this.transactionService.transactions$.subscribe(transactions => {
        transactions.forEach(t => {
          if (t.type === 'expense') {
            const cat = t.category;
            this.depensesParCategorie[cat] = (this.depensesParCategorie[cat] || 0) + Math.abs(Number(t.amount));
          }
        });

        this.budgets.forEach(budget => {
          const depense = this.depensesParCategorie[budget.category] || 0;
          if (depense > budget.amount) {
            this.alertesDepassement.push(
              `⚠️ Dépassement du budget pour ${budget.category} (${depense.toLocaleString('fr-FR')} FCFA / ${budget.amount.toLocaleString('fr-FR')} FCFA)`
            );
          }
        });
      });
    });
  }
}
