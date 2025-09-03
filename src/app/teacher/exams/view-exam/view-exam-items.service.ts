import { computed, Injectable, signal } from '@angular/core';
import { IItem } from '../exam.service';

@Injectable({
  providedIn: 'root',
})
export class ViewExamItemsService {
  itemsSig = signal<IItem[]>([]);

  addItem(item: IItem) {
    this.itemsSig.update((items) => [...items, item]);
  }

  removeItem(item: IItem) {
    this.itemsSig.update((items) => items.filter((i) => i.id !== item.id));
  }
}
