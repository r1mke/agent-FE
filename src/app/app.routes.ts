import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { TrainingStudio } from './pages/training-studio/training-studio';
import { AdminPanel } from './pages/admin-panel/admin-panel';

export const routes: Routes = [
    { path: '', component: Dashboard },
    { path: 'training', component: TrainingStudio },
    { path: 'admin', component: AdminPanel },
    { path: '**', redirectTo: '' }
];