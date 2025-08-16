import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NavbarComponent } from '../components/navbar/navbar.component';

@Component({
  selector: 'home',
  imports: [ButtonModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
