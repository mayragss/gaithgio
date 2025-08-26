export interface ProductFilters {
  availability?: 'in-stock' | 'out-of-stock';
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'most_sold' | 'most_viewed';
  minPrice?: number;
  maxPrice?: number;
  category?: string;
}