export interface Product {
  id: number;
  name: string;
  description: string | { pt?: string; en?: string } | any;
  description_pt?: string;
  description_en?: string;
  price: number;
  stock: number;
  category: string;
  collection: string;
  attributes: any;
  images: string[];
  sold: number;
  views: number;
}