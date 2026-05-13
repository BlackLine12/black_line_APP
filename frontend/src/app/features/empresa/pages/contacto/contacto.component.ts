import { Component, signal, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer.component';

interface Faq {
  pregunta: string;
  respuesta: string;
  abierto: boolean;
}

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarComponent, FooterComponent],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.scss',
})
export class ContactoComponent {
  private fb = inject(FormBuilder);

  readonly enviado = signal(false);
  readonly enviando = signal(false);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.email]],
    asunto: ['soporte', Validators.required],
    mensaje: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
  });

  readonly faqs = signal<Faq[]>([
    {
      pregunta: '¿Cómo puedo registrarme como artista en BlackLine?',
      respuesta: 'Puedes crear tu cuenta como estudio/artista desde la página de registro. Una vez verificado tu perfil, podrás recibir solicitudes de cita de clientes.',
      abierto: false,
    },
    {
      pregunta: '¿Cuándo estará disponible la versión pública de la plataforma?',
      respuesta: 'BlackLine es actualmente un proyecto universitario en fase de desarrollo. Esperamos lanzar la versión pública en el segundo semestre de 2026 tras nuestra graduación.',
      abierto: false,
    },
    {
      pregunta: '¿Puedo colaborar o contribuir al proyecto?',
      respuesta: 'Sí, estamos abiertos a colaboraciones. Contáctanos por correo con el asunto "Colaboración" y cuéntanos cómo te gustaría contribuir.',
      abierto: false,
    },
  ]);

  get mensajeLength(): number {
    return this.form.get('mensaje')?.value?.length ?? 0;
  }

  toggleFaq(index: number): void {
    this.faqs.update(items =>
      items.map((item, i) => ({ ...item, abierto: i === index ? !item.abierto : false }))
    );
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nombre, correo, asunto, mensaje } = this.form.value;
    const subject = encodeURIComponent(`[BlackLine] ${asunto} - ${nombre}`);
    const body = encodeURIComponent(`Nombre: ${nombre}\nCorreo: ${correo}\nAsunto: ${asunto}\n\n${mensaje}`);
    window.location.href = `mailto:al215510@alumnos.uacj.mx?subject=${subject}&body=${body}`;
    this.enviado.set(true);
  }
}
