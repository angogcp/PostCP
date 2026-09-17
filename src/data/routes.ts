export interface RouteShift {
  id: string;
  name: string; // 例: '2号便'
  timeRange: string; // 例: '10:10 〜 12:06'
  description: string;
  qrImage: string;
  badgeColor: string;
  binQrData: string;  // 便QRコードのデータ (例: 'BIN:02;' または '2号便')
  wardQrData: string; // 区QRコードのデータ (例: 'WRD:03;' または '3区')
}

export interface WardRoutes {
  ward: number;
  wardName: string;
  defaultWardQrData: string;
  bannerImage?: string;
  weekday: RouteShift[];
}

export const WARD_ROUTES: Record<number, WardRoutes> = {
  3: {
    ward: 3,
    wardName: '3区',
    defaultWardQrData: 'DIV:03',
    bannerImage: '/images/routes/weekday_all_3ku.jpg',
    weekday: [
      {
        id: 'bin2',
        name: '2号便',
        timeRange: '10:10 〜 12:06',
        description: '午前収集（全28箇所）',
        qrImage: '/images/routes/weekday_bin2_3ku.jpg',
        badgeColor: 'bg-blue-600 text-white',
        binQrData: 'BIN:02',
        wardQrData: 'DIV:03',
      },
      {
        id: 'bin3',
        name: '3号便',
        timeRange: '14:10 〜 16:06',
        description: '午後収集（全28箇所）',
        qrImage: '/images/routes/weekday_bin3_3ku.jpg',
        badgeColor: 'bg-emerald-600 text-white',
        binQrData: 'BIN:03',
        wardQrData: 'DIV:03',
      },
      {
        id: 'special',
        name: '特便',
        timeRange: '17:00 〜 17:21',
        description: '夕方主要局収集（4箇所のみ）',
        qrImage: '/images/routes/weekday_special_3ku.jpg',
        badgeColor: 'bg-amber-600 text-white',
        binQrData: 'BIN:04',
        wardQrData: 'DIV:03',
      },
    ],
  },
};
