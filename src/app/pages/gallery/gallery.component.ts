import { Component, inject, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import galleryData from '../../../../public/resources/gallery.json';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

interface GalleryItem {
  alt: string;
  path: string;
  type?: 'image' | 'video';
  thumbnail?: string; // Imagem de capa para vídeos
}

@Component({
  selector: 'gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  imports: [NavbarComponent, FooterComponent, CommonModule, TranslatePipe],
  standalone: true
})
export class GalleryComponent {
  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);
  images: GalleryItem[] = galleryData;
  videos: GalleryItem[] = [
    { alt: 'Video 1', path: 'images/video-1.mp4', type: 'video', thumbnail: 'images/capa-video-1.jpeg' },
    { alt: 'Video 2', path: 'images/video-2.mp4', type: 'video', thumbnail: 'images/capa-video-2.jpeg' },
    { alt: 'Video 3', path: 'images/video-3.mp4', type: 'video', thumbnail: 'images/capa-video-3.jpeg' }
  ];
  
  allItems: GalleryItem[] = [...this.images, ...this.videos];
  
  selectedVideo: string | null = null;
  showVideoPlayer = false;

  getVideoPath(path: string): string {
    return `/${path}`;
  }

  getThumbnailPath(thumbnail: string | undefined): string {
    return thumbnail ? `/${thumbnail}` : '';
  }

  openVideo(videoPath: string) {
    this.selectedVideo = `/${videoPath}`;
    this.showVideoPlayer = true;
  }

  closeVideo() {
    this.showVideoPlayer = false;
    this.selectedVideo = null;
  }

  constructor() {
    // Effect para detectar mudanças no idioma e forçar atualização
    effect(() => {
      this.languageService.currentLanguage();
      this.cdr.markForCheck();
    });
  }
}
