import { Component, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { LogoutComfirmModal } from './logout-comfirm-modal/logout-comfirm-modal';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-logout-button',
  imports: [FaIconComponent, LogoutComfirmModal],
  templateUrl: './logout-button.html',
  styleUrl: './logout-button.css',
})
export class LogoutButton {
  private auth = inject(AuthService);
  private router = inject(Router);

  isOpenSig = signal(false);
  isConfirmedSig = signal(false);

  protected faRightFromBracket = faRightFromBracket;

  open() {
    this.isOpenSig.set(true);
  }

  close() {
    this.isOpenSig.set(false);
  }

  confirm() {
    this.isConfirmedSig.set(true);
    this.auth.logout();
    this.isConfirmedSig.set(false);
    this.router.navigate(['/login']);
    this.close();
  }
}
