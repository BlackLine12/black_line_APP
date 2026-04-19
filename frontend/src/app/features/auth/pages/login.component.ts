import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private returnUrl: string | null = null;

  loginForm: FormGroup = this.fb.group({
    credential: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const registered = this.route.snapshot.queryParamMap.get('registered');
    const force = this.route.snapshot.queryParamMap.get('force');
    if (registered === '1') {
      this.successMessage = 'Cuenta creada con éxito. Ahora inicia sesión.';
    }

    // If already logged in, redirect to their dashboard
    if (force !== '1' && this.authService.isAuthenticated()) {
      this.authService.redirectByRole();
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) return;
    this.loading = true;
    this.errorMessage = '';

    const { credential, password } = this.loginForm.value;
    this.authService.login(credential, password).subscribe({
      next: () => {
        this.loading = false;
        if (this.returnUrl && this.returnUrl !== '/' && !this.returnUrl.startsWith('/auth')) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.authService.redirectByRole();
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar al servidor. Verifica que el backend esté corriendo.';
        } else if (err.status === 400 || err.status === 401) {
          this.errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
        } else {
          this.errorMessage =
            err.error?.detail ?? 'Error al iniciar sesión. Intenta de nuevo.';
        }
      },
    });
  }
}
