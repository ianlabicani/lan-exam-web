import { Component, input } from '@angular/core';
import { EssayForm } from '../forms/essay-form/essay-form';
import { McqForm } from '../forms/mcq-form/mcq-form';
import { TrueOrFalseForm } from '../forms/true-or-false-form/true-or-false-form';

@Component({
  selector: 'app-teacher-exam-create-item-form',
  imports: [McqForm, TrueOrFalseForm, EssayForm],
  templateUrl: './create-item-form.html',
  styleUrl: './create-item-form.css',
})
export class CreateItemForm {
  examIdSig = input.required<number>();
}
