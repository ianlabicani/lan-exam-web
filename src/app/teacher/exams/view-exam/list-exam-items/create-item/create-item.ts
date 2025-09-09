import { Component, input } from '@angular/core';
import { EssayForm } from './essay-form/essay-form';
import { McqForm } from './mcq-form/mcq-form';
import { TrueOrFalseForm } from './true-or-false-form/true-or-false-form';

@Component({
  selector: 'app-teacher-exam-create-item-form',
  imports: [McqForm, TrueOrFalseForm, EssayForm],
  templateUrl: './create-item.html',
  styleUrl: './create-item.css',
})
export class CreateItem {
  examIdSig = input.required<number>();
}
