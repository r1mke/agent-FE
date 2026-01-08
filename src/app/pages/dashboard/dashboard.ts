import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Važno za *ngIf i *ngFor
import { ApiService } from '../../services/api.service';
import { ImageSample } from '../../models/api-models';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  
  recentSamples: ImageSample[] = [];
  isDragging = false;
  uploading = false;

  constructor(
    private api: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults() {
    this.api.getResults().subscribe({
      next: (data) => {
        this.recentSamples = data;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Ne mogu učitati rezultate.', 'Greška');
      }
    });
  }

  // --- Drag & Drop Logika ---
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer?.files.length) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files.length) {
      this.handleFiles(event.target.files);
    }
  }

  handleFiles(files: FileList) {
    if (files.length === 0) return;
    
    this.uploading = true;
    let completed = 0;

    // Uploadaj svaku sliku pojedinačno
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Default task je 'Scoring' (analiza), ne trening
      this.api.upload(file, 'Scoring').subscribe({
        next: () => {
          completed++;
          if (completed === files.length) {
            this.toastr.success(`Uspješno učitano ${files.length} slika!`, 'Polenko');
            this.uploading = false;
            // Osvježi listu nakon kratke pauze (dok backend obradi)
            setTimeout(() => this.loadResults(), 1000); 
          }
        },
        error: () => {
          this.toastr.error(`Greška pri učitavanju slike ${file.name}`);
          this.uploading = false;
        }
      });
    }
  }

  // Pomoćna funkcija za boju okvira
  getBorderColor(prediction: any): string {
    if (!prediction) return 'border-gray-300';
    if (prediction.predictedLabel === 'Pollen') return 'border-honey'; // Žuta za polen
    return 'border-gray-400'; // Siva za NoPollen
  }

  // Dodaj ovu metodu na dno klase, prije zatvaranja }
getImageUrl(fullPath: string): string {
  if (!fullPath) return 'assets/bee-placeholder.png';
  
  // Izvuci samo ime fajla iz pune putanje
  // Ovo radi i za Windows (\) i za Linux (/) putanje
  const filename = fullPath.split(/[\\/]/).pop();
  
  // Vrati URL koji backend servira
  // PAZI: Port mora biti isti kao u ApiService (7152 ili koji već koristiš)
  return `http://localhost:5036/images/${filename}`;
}
}