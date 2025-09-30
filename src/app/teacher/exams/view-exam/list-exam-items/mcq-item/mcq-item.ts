import { Component, inject, input, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { ExamItem } from '../list-exam-items.service';

@Component({
  selector: 'app-mcq-item',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './mcq-item.html',
  styleUrls: ['./mcq-item.css'],
})
export class McqItem {
  item = input.required<ExamItem>();
}
