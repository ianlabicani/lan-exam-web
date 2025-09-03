import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tof-item',
  imports: [NgClass],
  templateUrl: './tof-item.html',
  styleUrl: './tof-item.css',
})
export class TofItem {
  itemSig = input<any>();
}
