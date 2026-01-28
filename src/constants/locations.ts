export interface City {
  name: string;
  slug: string;
  neighborhoods?: Neighborhood[];
}

export interface Neighborhood {
  name: string;
  slug: string;
}

export const LOCATIONS: City[] = [
  {
    name: 'San Francisco',
    slug: 'san-francisco',
    neighborhoods: [
      { name: 'Chinatown', slug: 'chinatown' },
      { name: 'Fishermans Wharf', slug: 'fishermans-wharf' },
      { name: 'Hayes Valley', slug: 'hayes-valley' },
      { name: 'Mission', slug: 'mission' },
      { name: 'Richmond', slug: 'richmond' },
      { name: 'Silver', slug: 'silver' },
      { name: 'Sunset', slug: 'sunset' },
    ],
  },
  { name: 'South San Francisco', slug: 'south-san-francisco' },
  { name: 'San Mateo', slug: 'san-mateo' },
  { name: 'Daly City', slug: 'daly-city' },
  { name: 'Millbrae', slug: 'millbrae' },
  { name: 'Napa', slug: 'napa' },
];
