import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ImageSample } from '../../models/api-models';
import { ToastrService } from 'ngx-toastr';
import { SystemStatus } from '../../models/api-models';

@Component({
  selector: 'app-training-studio',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './training-studio.html',
  styleUrl: './training-studio.css',
})
export class TrainingStudio implements OnInit {

  queue: ImageSample[] = [];
  currentSample: ImageSample | null = null;
  loading = false;
  remainingCount = 0;

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadQueue();
  }

  loadQueue() {
    this.loading = true;
    this.api.getPendingReview().subscribe({
      next: (data) => {
        this.queue = data.samples;
        this.remainingCount = data.count;

        if (!this.currentSample) {
            this.nextImage();
        }

        this.loading = false;
      },
      error: () => {
        this.toastr.error('Greška pri učitavanju slika.');
        this.loading = false;
      }
    });
  }

  nextImage() {
    if (this.queue.length > 0) {
      this.currentSample = this.queue.shift() || null;
    } else {
      this.currentSample = null;
    }
  }


  submitReview(isPollen: boolean) {
    if (!this.currentSample) return;

    const sampleId = this.currentSample.id;

    if (this.queue.length > 0) {
        this.nextImage();
    } else {
        this.currentSample = null;
    }

    this.api.reviewSample({ sampleId, isPollen }).subscribe({
      next: () => {
        this.toastr.success(isPollen ? 'Označeno: POLEN' : 'Označeno: BEZ POLENA', '', { timeOut: 1000 });
        this.remainingCount--;

        if (this.queue.length === 0 && !this.currentSample) {
             this.loadQueue();
        }
      },
      error: () => {
        this.toastr.error('Nisam uspio spasiti odluku.');

      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.currentSample) return;

    if (event.key === 'ArrowLeft') {
      this.submitReview(false);
    } else if (event.key === 'ArrowRight') {
      this.submitReview(true);
    }
  }

  getImageUrl(fullPath: string): string {
    if (!fullPath) return 'assets/bee-placeholder.png';

    const filename = fullPath.split(/[\\/]/).pop();

    if (fullPath.includes('UserUploads')) {
      return `http://localhost:5036/images/${filename}`;
    } else if (fullPath.includes('bee_imgs')) {
      return `http://localhost:5036/dataset/${filename}`;
    }

    return `http://localhost:5036/images/${filename}`;
  }


}
