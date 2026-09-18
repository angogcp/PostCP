export interface PostScheduleTimes {
  bin2?: string;      // 2号便 (例: "10:10")
  bin3?: string;      // 3号便 (例: "14:10")
  special?: string;   // 特便 (例: "17:00")
}

export interface PostSchedule {
  weekday?: PostScheduleTimes;
  holiday?: PostScheduleTimes;
}

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
  schedule?: PostSchedule;
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
