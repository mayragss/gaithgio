import { Component } from '@angular/core';
import galleryData from '../../../../public/resources/gallery.json';
import { NavbarComponent } from '../../components/navbar/navbar.component';

interface GalleryItem {
  alt: string;
  path: string;
}

@Component({
  selector: 'gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  imports: [NavbarComponent],
  standalone: true
})
export class GalleryComponent {
  images: GalleryItem[] = galleryData;
}
