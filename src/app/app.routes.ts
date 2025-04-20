import { Routes } from '@angular/router';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { SettingsComponent } from './settings/settings.component';
import { DashboardComponent } from './dashboard/dashboard.component'; // à ajouter si tu l'as
import { AboutComponent } from './about/about.component';


export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'statict', component: StatisticsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'apropos', component: AboutComponent },
  { path: '**', redirectTo: 'dashboard' }
];
