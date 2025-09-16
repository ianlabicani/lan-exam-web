import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TrueOrFalseFormModalService {
  isModalOpen = signal(false);

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }
}
