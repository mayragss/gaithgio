import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import galleryData from '../../../../public/resources/gallery.json';
import { NavbarComponent } from '../../components/navbar/navbar.component';

interface GalleryItem {
  alt: string;
  path: string;
  type?: 'image' | 'video';
}

@Component({
  selector: 'gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  imports: [NavbarComponent, CommonModule],
  standalone: true
})
export class GalleryComponent {
  images: GalleryItem[] = galleryData;
  videos: GalleryItem[] = [
    { alt: 'Video 1', path: 'images/video-1.mp4', type: 'video' },
    { alt: 'Video 2', path: 'images/video-2.mp4', type: 'video' },
    { alt: 'Video 3', path: 'images/video-3.mp4', type: 'video' }
  ];
  
  allItems: GalleryItem[] = [...this.images, ...this.videos];
  
  selectedVideo: string | null = null;
  showVideoPlayer = false;

  getVideoPath(path: string): string {
    return `/${path}`;
  }

  openVideo(videoPath: string) {
    this.selectedVideo = `/${videoPath}`;
    this.showVideoPlayer = true;
  }

  closeVideo() {
    this.showVideoPlayer = false;
    this.selectedVideo = null;
  }
}
