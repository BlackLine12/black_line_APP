import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminResetPasswordResponse, AdminUserService } from '../../../core/services/admin-user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent {
  private readonly fb = inject(FormBuilder);
  private readonly adminUserService = inject(AdminUserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly successMessage = signal('');
  readonly resetUserId = signal<number | null>(null);
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly form = this.fb.group({
    userId: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
    newPassword: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    newPasswordConfirm: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    confirm: this.fb.control(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
  });

  submit(): void {
    if (this.form.invalid || this.loading()) return;

    const userId = this.form.controls.userId.value;
    if (!userId) return;

    this.loading.set(true);
    this.error.set('');
    this.successMessage.set('');
    this.resetUserId.set(null);

    const { newPassword, newPasswordConfirm } = this.form.controls;
    this.adminUserService.resetPassword(userId, newPassword.value, newPasswordConfirm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: AdminResetPasswordResponse) => {
          this.loading.set(false);
          this.successMessage.set(res.message || 'Contrasena actualizada exitosamente.');
          this.resetUserId.set(res.user_id);
          this.form.controls.confirm.setValue(false);
          this.form.controls.newPassword.setValue('');
          this.form.controls.newPasswordConfirm.setValue('');
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.error.set(
            err.error?.detail ??
            err.error?.new_password?.[0] ??
            err.error?.user_id?.[0] ??
            'No se pudo reiniciar la contrasena. Intenta de nuevo.'
          );
        },
      });
  }

  clear(): void {
    this.form.reset({ userId: null, newPassword: '', newPasswordConfirm: '', confirm: false });
    this.error.set('');
    this.successMessage.set('');
    this.resetUserId.set(null);
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  get newPasswordValue(): string {
    return this.form.controls.newPassword.value;
  }

  get newPasswordConfirmValue(): string {
    return this.form.controls.newPasswordConfirm.value;
  }

  get newPasswordMinLengthOk(): boolean {
    return this.newPasswordValue.length >= 8;
  }

  get newPasswordNotNumericOnly(): boolean {
    if (!this.newPasswordValue.length) {
      return false;
    }
    return !/^\d+$/.test(this.newPasswordValue);
  }

  get newPasswordMatches(): boolean {
    if (!this.newPasswordConfirmValue.length) {
      return false;
    }
    return this.newPasswordValue === this.newPasswordConfirmValue;
  }

}
