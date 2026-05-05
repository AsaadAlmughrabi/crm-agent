import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-card',
  imports: [CommonModule],
  templateUrl: './upload-card.html',
  styleUrl: './upload-card.css',
})
export class UploadCard {
  // Inputs
  isUploading = input<boolean>(false);
  isProcessing = input<boolean>(false);
  isDragOver = input<boolean>(false);
  uploadError = input<string | null>('');
  uploadSuccess = input<string | null>('');

  // Outputs
  fileSelected = output<File>();
  dragOver = output<DragEvent>();
  dragLeave = output<DragEvent>();
  drop = output<DragEvent>();

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileSelected.emit(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    this.dragOver.emit(event);
  }

  onDragLeave(event: DragEvent) {
    this.dragLeave.emit(event);
  }

  onDrop(event: DragEvent) {
    this.drop.emit(event);
  }
}
