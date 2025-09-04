import { Component, input, output } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faRightFromBracket,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-logout-comfirm-modal',
  imports: [FaIconComponent],
  templateUrl: './logout-comfirm-modal.html',
  styleUrl: './logout-comfirm-modal.css',
})
export class LogoutComfirmModal {
  isOpenSig = input();
  isConfirmedSig = input();
  open = output<void>();
  close = output<void>();
  confirm = output<void>();

  faRightFromBracket = faRightFromBracket;
  faSpinner = faSpinner;
}
