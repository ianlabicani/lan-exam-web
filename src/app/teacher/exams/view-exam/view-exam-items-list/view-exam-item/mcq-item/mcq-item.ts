import { Component, input } from '@angular/core';

@Component({
  selector: 'app-mcq-item',
  imports: [],
  templateUrl: './mcq-item.html',
  styleUrl: './mcq-item.css',
})
export class McqItem {
  itemSig = input<any>();
}
