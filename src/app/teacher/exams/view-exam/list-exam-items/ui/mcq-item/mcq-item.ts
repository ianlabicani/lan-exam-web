import { Component, inject, input, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ExamItem } from '../../list-exam-items.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckSquare, faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-mcq-item',
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './mcq-item.html',
  styleUrls: ['./mcq-item.css'],
})
export class McqItem {
  item = input.required<ExamItem>();

  faCheckSquare = faCheckSquare;
  faCheck = faCheck;
}
