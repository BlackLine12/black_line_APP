import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  registerForm: FormGroup = this.fb.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    user_type: ['CLIENT', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirm: ['', [Validators.required]],
  });

  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    const role = this.route.snapshot.queryParamMap.get('role');
    if (role === 'CLIENT' || role === 'STUDIO') {
      this.registerForm.patchValue({ user_type: role });
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.loading) return;

    const { password, password_confirm } = this.registerForm.value;
    if (password !== password_confirm) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Cuenta creada exitosamente. Redirigiendo al login…';
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: { registered: '1' },
            replaceUrl: true,
          });
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        const errors = err.error;
        if (typeof errors === 'object') {
          const messages = Object.values(errors).flat();
          this.errorMessage = (messages as string[]).join(' ');
        } else {
          this.errorMessage = 'Error al crear la cuenta. Intenta de nuevo.';
        }
      },
    });
  }
}
