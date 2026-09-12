export interface PostItem {
  id: string;
  ward: number;
  number: number;
  name: string;
  code?: string;
  address?: string;
  qrContent?: string;
  originalFilename?: string;
  imagePath: string;
}

export type WardId = 1 | 2 | 3;

export interface WardInfo {
  id: WardId;
  name: string;
  shortName: string;
}

export const WARDS: WardInfo[] = [
  { id: 1, name: '１区', shortName: '1区' },
  { id: 2, name: '２区', shortName: '2区' },
  { id: 3, name: '３区', shortName: '3区' },
];
