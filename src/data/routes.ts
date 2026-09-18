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
  holiday?: RouteShift[];
  holidayBannerImage?: string;
}

export const WARD_ROUTES: Record<number, WardRoutes> = {
  3: {
    ward: 3,
    wardName: '3区',
    defaultWardQrData: 'DIV:01;C01:003;N01:3区;',
    bannerImage: '/images/routes/weekday_all_3ku.jpg',
    holidayBannerImage: '/images/routes/holiday_all_3ku.jpg',
    weekday: [
      {
        id: 'bin2',
        name: '2号便',
        timeRange: '10:10 〜 12:06',
        description: '午前収集（全28箇所）',
        qrImage: '/images/routes/weekday_bin2_3ku.jpg',
        badgeColor: 'bg-blue-600 text-white',
        binQrData: 'BIN:01;D01:01;S01:01;B01:02;N01:平日取集２号便;',
        wardQrData: 'DIV:01;C01:003;N01:3区;',
      },
      {
        id: 'bin3',
        name: '3号便',
        timeRange: '14:10 〜 16:06',
        description: '午後収集（全28箇所）',
        qrImage: '/images/routes/weekday_bin3_3ku.jpg',
        badgeColor: 'bg-emerald-600 text-white',
        binQrData: 'BIN:01;D01:01;S01:01;B01:03;N01:平日取集３号便;',
        wardQrData: 'DIV:01;C01:003;N01:3区;',
      },
      {
        id: 'special',
        name: '特便',
        timeRange: '17:00 〜 17:21',
        description: '夕方主要局収集（4箇所のみ）',
        qrImage: '/images/routes/weekday_special_3ku.jpg',
        badgeColor: 'bg-amber-600 text-white',
        binQrData: 'BIN:01;D01:01;S01:01;B01:04;N01:平日取集４号便;',
        wardQrData: 'DIV:01;C01:003;N01:3区;',
      },
    ],
    holiday: [
      {
        id: 'bin2',
        name: '2号便',
        timeRange: '10:00 〜 12:05',
        description: '午前収集（全30箇所）',
        qrImage: '/images/routes/holiday_bin2_3ku.jpg',
        badgeColor: 'bg-blue-600 text-white',
        binQrData: 'BIN:01;D01:03;S01:01;B01:02;N01:休日取集２号便;',
        wardQrData: 'DIV:01;C01:003;N01:3区;',
      },
      {
        id: 'bin3',
        name: '3号便',
        timeRange: '15:00 〜 17:05',
        description: '午後収集（全30箇所）',
        qrImage: '/images/routes/holiday_bin3_3ku.jpg',
        badgeColor: 'bg-emerald-600 text-white',
        binQrData: 'BIN:01;D01:03;S01:01;B01:03;N01:休日取集３号便;',
        wardQrData: 'DIV:01;C01:003;N01:3区;',
      },
    ],
  },
};
