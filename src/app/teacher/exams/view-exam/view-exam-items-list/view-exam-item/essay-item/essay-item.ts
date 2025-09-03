import { Component, input } from '@angular/core';

@Component({
  selector: 'app-essay-item',
  imports: [],
  templateUrl: './essay-item.html',
  styleUrl: './essay-item.css',
})
export class EssayItem {
  itemSig = input<any>();
}
