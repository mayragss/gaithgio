import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'size-chart',
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './size-chart.component.html',
  styleUrls: ['./size-chart.component.scss']
})
export class SizeChartComponent {

}

