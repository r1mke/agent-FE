import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  
  isDragging = false;
  uploading = false;
  
  uploadStats: {
    todayUploads: number;
    pendingReview: number;
    reviewed: number;
  } | null = null;

  constructor(
    private api: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadStats();
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

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.api.upload(file, 1).subscribe({
        next: () => {
          completed++;
          if (completed === files.length) {
            this.toastr.success(`Uspješno učitano ${files.length} slika!`, 'Polenko');
            this.uploading = false;
            // Osvježi statistiku
            setTimeout(() => this.loadStats(), 1500); 
          }
        },
        error: () => {
          this.toastr.error(`Greška pri učitavanju slike ${file.name}`);
          this.uploading = false;
        }
      });
    }
  }
}