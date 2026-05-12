import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer.component';

interface TeamMember {
  nombre: string;
  rol: string;
  especialidad: string;
  bio: string;
  iniciales: string;
}

@Component({
  selector: 'app-sobre-nosotros',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './sobre-nosotros.component.html',
  styleUrl: './sobre-nosotros.component.scss',
})
export class SobreNosotrosComponent {
  readonly equipo = signal<TeamMember[]>([
    {
      nombre: 'Oscar Alonso Nava Rivera',
      rol: 'Product Owner & Backend Lead',
      especialidad: 'Ingeniería de Software',
      bio: 'Responsable de la arquitectura Django REST y la visión del producto. Lidera el diseño de la API y la lógica de negocio del sistema de matchmaking.',
      iniciales: 'ON',
    },
    {
      nombre: 'Carlos Gael de Haro Cárdenas',
      rol: 'Frontend Lead',
      especialidad: 'Ingeniería de Software',
      bio: 'Diseña e implementa la experiencia de usuario en Angular. Responsable del sistema de diseño BlackLine y la navegación entre flujos.',
      iniciales: 'CG',
    },
    {
      nombre: 'Arturo Pérez González',
      rol: 'UX / UI Designer',
      especialidad: 'Ingeniería de Software',
      bio: 'Define la identidad visual de la plataforma y los flujos de usuario. Equilibra la estética artística con la usabilidad.',
      iniciales: 'AP',
    },
    {
      nombre: 'Alejandro Campa Alonso',
      rol: 'Backend Developer',
      especialidad: 'Ingeniería de Software',
      bio: 'Desarrolla los modelos de base de datos, migraciones y endpoints REST. Gestiona la infraestructura Docker y los entornos de desarrollo.',
      iniciales: 'AC',
    },
    {
      nombre: 'Carlos Eduardo Escárzaga Vázquez',
      rol: 'QA & DevOps',
      especialidad: 'Ingeniería de Software',
      bio: 'Garantiza la calidad del código mediante pruebas automatizadas y coordina el pipeline de integración continua del proyecto.',
      iniciales: 'CE',
    },
  ]);

  readonly valores = signal([
    {
      icono: '◈',
      titulo: 'Innovación',
      descripcion: 'Aplicamos tecnología de matchmaking inteligente para transformar cómo las personas encuentran su artista ideal.',
    },
    {
      icono: '◇',
      titulo: 'Arte',
      descripcion: 'Creemos que el tatuaje es una forma de arte legítima. Nuestra plataforma pone al artista en el centro.',
    },
    {
      icono: '○',
      titulo: 'Comunidad',
      descripcion: 'Construimos puentes entre clientes y artistas, fomentando relaciones de confianza y colaboración.',
    },
  ]);
}
