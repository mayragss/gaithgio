export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  collection: string;
  attributes: any;
  images: string[];
  sold: number;
  views: number;
}