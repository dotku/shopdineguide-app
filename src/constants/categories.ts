export interface Category {
  name: string;
  slug: string;
  icon: string;
}

export const FOOD_CATEGORIES: Category[] = [
  { name: 'Asian', slug: 'asian', icon: 'restaurant' },
  { name: 'Sushi', slug: 'sushi', icon: 'fish' },
  { name: 'Pizza', slug: 'pizza', icon: 'pizza' },
  { name: 'Bars', slug: 'bars', icon: 'beer' },
  { name: 'Beverages', slug: 'beverages', icon: 'cafe' },
  { name: 'Burgers', slug: 'burgers', icon: 'fast-food' },
  { name: 'Chinese', slug: 'chinese', icon: 'restaurant' },
  { name: 'Dim Sum', slug: 'dim-sum', icon: 'restaurant' },
  { name: 'Bakery', slug: 'bakery', icon: 'nutrition' },
  { name: 'Cake', slug: 'cake', icon: 'ice-cream' },
];
