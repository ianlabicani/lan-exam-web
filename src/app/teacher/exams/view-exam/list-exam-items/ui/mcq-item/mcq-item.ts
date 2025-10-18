import { Component, inject, input, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckSquare, faCheck } from '@fortawesome/free-solid-svg-icons';
import { ExamItem } from '../../../view-exam.service';

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
