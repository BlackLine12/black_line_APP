import { Component } from '@angular/core';
import { PortfolioUploadComponent } from './portfolio-upload.component';

@Component({
  selector: 'app-portafolio',
  standalone: true,
  imports: [PortfolioUploadComponent],
  templateUrl: './portafolio.component.html',
  styleUrl: './portafolio.component.scss'
})
export class PortafolioComponent {}
