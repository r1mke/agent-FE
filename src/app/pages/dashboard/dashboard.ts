import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

interface AnalysisResult {
  id: string;
  imageUrl: string;
  score: number;
  label: string;
  decision: string;
  reviewedByUser?: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {

  isDragging = false;
  uploading = false;

  uploadStats: {
    todayUploads: number;
    pendingReview: number;
    reviewed: number;
  } | null = null;


  analysisResults: AnalysisResult[] = [];
  hasPendingReviews = false;


  private pendingIds: string[] = [];
  private pollingInterval: any;

  constructor(
    private api: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadStats() {
    this.api.getUploadStats().subscribe({
      next: (data) => {
        this.uploadStats = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


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
    this.pendingIds = [];
    this.analysisResults = [];
    let completed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.api.upload(file, 1).subscribe({
        next: (response) => {

          this.pendingIds.push(response.sampleId);

          completed++;
          if (completed === files.length) {
            this.toastr.success(`Uploadovano ${files.length} slika - čekam analizu...`, 'Polenko');
            this.uploading = false;

            // Pokreni polling za rezultate
            this.startPolling();
          }
        },
        error: () => {
          this.toastr.error(`Greška pri učitavanju slike ${file.name}`);
          this.uploading = false;
        }
      });
    }
  }

  startPolling() {
    let attempts = 0;
    const maxAttempts = 30;

    this.pollingInterval = setInterval(() => {
      attempts++;

      this.api.getResultsByIds(this.pendingIds).subscribe({
        next: (results) => {

          const finished = results.filter((r: any) =>
            r.status !== 0 && r.status !== 1 // 0=Queued, 1=Processing
          );


          this.analysisResults = finished.map((r: any) => ({
            id: r.id,
            imageUrl: this.getImageUrl(r.imagePath),
            score: r.predictions?.[0]?.score || 0,
            label: r.predictions?.[0]?.predictedLabel || 'Unknown',
            decision: r.predictions?.[0]?.decision || 'Unknown'
          }));


          this.hasPendingReviews = this.analysisResults.some(r => r.decision === 'PendingReview');


          if (finished.length === this.pendingIds.length) {
            this.stopPolling();
            this.loadStats();

            if (this.hasPendingReviews) {
              this.toastr.warning('Neke slike trebaju tvoj review!', 'Pažnja');
            } else {
              this.toastr.success('Sve slike uspješno analizirane!', 'Gotovo');
            }
          }


          if (attempts >= maxAttempts) {
            this.stopPolling();
            this.toastr.info('Analiza još traje u pozadini...', 'Info');
          }
        }
      });
    }, 1000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  clearResults() {
    this.analysisResults = [];
    this.hasPendingReviews = false;
  }

  getImageUrl(fullPath: string): string {
    if (!fullPath) return 'assets/bee-placeholder.png';
    const filename = fullPath.split(/[\\/]/).pop();
    return `http://localhost:5036/images/${filename}`;
  }


  quickReview(result: AnalysisResult, isPollen: boolean) {

    result.reviewedByUser = true;

    this.api.reviewSample({
      sampleId: result.id,
      isPollen: isPollen
    }).subscribe({
      next: () => {

        this.loadStats();

        const text = isPollen ? "Potvrđeno: IMA POLENA" : "Potvrđeno: NEMA POLENA";
        this.toastr.success(text, "Spremljeno");


        result.label = isPollen ? 'Pollen' : 'NoPollen';
        result.decision = 'Reviewed';
      },
      error: () => {
        result.reviewedByUser = false;
        this.toastr.error("Greška pri spremanju odluke.");
      }
    });
  }
}
