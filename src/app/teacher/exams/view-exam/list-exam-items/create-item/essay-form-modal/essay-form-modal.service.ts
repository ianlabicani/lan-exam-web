import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EssayFormModalService {
  isModalOpen = signal(false);

  constructor() {}

  closeModal() {
    this.isModalOpen.set(false);
  }

  openModal() {
    this.isModalOpen.set(true);
  }
}
