import { Component, inject } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { routeFadeAnimation } from '../animations/route-animations';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  animations: [routeFadeAnimation],
  template: `
    <div style="display:flex; flex-direction:column; min-height:100vh; background:#0C0A08;">
      <app-navbar />
      <main style="flex:1;" [@routeAnimations]="getRouteAnimationData()">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
})
export class LayoutComponent {
  private contexts = inject(ChildrenOutletContexts);

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.url;
  }
}
