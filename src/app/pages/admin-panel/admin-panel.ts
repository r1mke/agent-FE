import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { SystemStatus } from '../../models/api-models';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
  standalone: true,
  imports: [CommonModule],

})
export class AdminPanel implements OnInit {

  status: SystemStatus | null = null;
  loading = false;

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus() {
    this.loading = true;
    this.api.getStatus().subscribe({
      next: (data) => {
        this.status = data;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Ne mogu učitati status sistema.');
        this.loading = false;
      }
    });
  }

  triggerRetrain() {
    if (!confirm('Jesi li siguran da želiš ručno pokrenuti trening modela?')) return;

    this.api.triggerRetrain().subscribe({
      next: (res) => {
        this.toastr.success('Trening pokrenut! Provjeri konzolu workera.', 'Uspjeh');
        this.loadStatus();
      },
      error: (err) => {
        this.toastr.error(err.error || 'Greška pri pokretanju treninga.');
      }
    });
  }

  resetDatabase() {
    const code = prompt('OPREZ: Ovo briše SVE slike i podatke!\nUnesi "DELETE" da potvrdiš:');

    if (code === 'DELETE') {
      this.api.resetDatabase().subscribe({
        next: (res) => {
          this.toastr.warning('Baza podataka je resetovana.', 'Reset');
          this.loadStatus();
        },
        error: () => {
          this.toastr.error('Neuspješan reset.');
        }
      });
    }
  }


  getTrainingProgress(): number {
    if (!this.status) return 0;
    const { newGoldSinceLastTrain, retrainThreshold } = this.status.training;
    const pct = (newGoldSinceLastTrain / retrainThreshold) * 100;
    return Math.min(pct, 100);
  }
}
