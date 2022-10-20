import {Artist} from '@/interfaces/artist';

const mockArtist: Artist[] = [
  {
    name: 'The Rolling Stones',
    imageUrl: 'https://i.scdn.co/image/85d9cb252ab4d8410d31820be40214c59f2597a1',
  },
  {
    name: 'The Beatles',
    imageUrl: 'https://i.scdn.co/image/6b2a709752ef9c7aaf0d270344157f6cd2e0f1a7',
  },
  {
    name: 'Steely Dan',
    imageUrl: 'https://i.scdn.co/image/9d01e4e9aac39b891d684d3d1a5b3a451d7c72bd',
  },
];

export function loadArtists(): Promise<Artist[]> {
  return new Promise((resolve) => resolve(mockArtist));
}
