import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faCheckSquare,
  faToggleOn,
  faPencilAlt,
  faFileAlt,
  faLink,
  faEdit,
  faPlusCircle,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-add-question-modal',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './add-question-modal.html',
  styleUrl: './add-question-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddQuestionModal {
  isOpen = input.required<boolean>();
  level = input.required<'easy' | 'moderate' | 'difficult'>();

  typeSelected = output<
    'mcq' | 'truefalse' | 'essay' | 'shortanswer' | 'matching' | 'fillblank'
  >();
  closeModal = output<void>();

  // FontAwesome icons
  faTimes = faTimes;
  faPlusCircle = faPlusCircle;
  faCheckSquare = faCheckSquare;
  faToggleOn = faToggleOn;
  faPencilAlt = faPencilAlt;
  faFileAlt = faFileAlt;
  faLink = faLink;
  faEdit = faEdit;

  questionTypes = [
    {
      type: 'mcq',
      name: 'Multiple Choice',
      description: 'Question with multiple options',
      icon: faCheckSquare,
      color: 'text-blue-600',
    },
    {
      type: 'truefalse',
      name: 'True/False',
      description: 'Binary choice question',
      icon: faToggleOn,
      color: 'text-green-600',
    },
    {
      type: 'shortanswer',
      name: 'Short Answer',
      description: 'Brief text response',
      icon: faPencilAlt,
      color: 'text-yellow-600',
    },
    {
      type: 'essay',
      name: 'Essay',
      description: 'Detailed written response',
      icon: faFileAlt,
      color: 'text-purple-600',
    },
    {
      type: 'matching',
      name: 'Matching',
      description: 'Match items to answers',
      icon: faLink,
      color: 'text-pink-600',
    },
    {
      type: 'fillblank',
      name: 'Fill in the Blank',
      description: 'Complete the sentence',
      icon: faEdit,
      color: 'text-orange-600',
    },
  ];

  selectType(
    type:
      | 'mcq'
      | 'truefalse'
      | 'essay'
      | 'shortanswer'
      | 'matching'
      | 'fillblank'
  ) {
    this.typeSelected.emit(type);
    this.closeModal.emit();
  }

  handleTypeSelection(type: string) {
    this.selectType(
      type as
        | 'mcq'
        | 'truefalse'
        | 'essay'
        | 'shortanswer'
        | 'matching'
        | 'fillblank'
    );
  }

  onClose() {
    this.closeModal.emit();
  }
}
