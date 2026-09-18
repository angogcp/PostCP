const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const sourceBase = path.join(rootDir, 'ポスト収集QRコード');
const targetBase = path.join(rootDir, 'public', 'qr');
const dataOutputDir = path.join(rootDir, 'src', 'data');

const wards = [
  { id: 1, name: '１区', folder: '１区' },
  { id: 2, name: '２区', folder: '２区' },
  { id: 3, name: '３区', folder: '３区' },
];

const existingPostsMap = new Map();
const existingJsonPath = path.join(dataOutputDir, 'posts.json');
if (fs.existsSync(existingJsonPath)) {
  try {
    const list = JSON.parse(fs.readFileSync(existingJsonPath, 'utf-8'));
    list.forEach((item) => existingPostsMap.set(item.id, item));
  } catch (e) {}
}

const allPosts = [];

wards.forEach((ward) => {
  const wardSourceDir = path.join(sourceBase, ward.folder);
  const wardTargetDir = path.join(targetBase, String(ward.id));

  if (!fs.existsSync(wardTargetDir)) {
    fs.mkdirSync(wardTargetDir, { recursive: true });
  }

  if (!fs.existsSync(wardSourceDir)) {
    return;
  }

  const files = fs.readdirSync(wardSourceDir);
  // -new ファイルを後に処理（上書き優先）
  files.sort((a, b) => {
    const aNew = a.includes('-new');
    const bNew = b.includes('-new');
    if (aNew && !bNew) return 1;
    if (!aNew && bNew) return -1;
    return a.localeCompare(b);
  });

  const wardPostsMap = new Map();

  files.forEach((file) => {
    // 拡張子のチェック
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return;

    // ファイル名から番号と名称を取得 (例: "1. 宮本たばこ店.jpg", "21.八雲西郵便局-new.jpg")
    const baseName = path.basename(file, ext).trim();
    const match = baseName.match(/^(\d+)[\.\s　]*(.*)$/);

    let number = 0;
    let name = baseName;

    if (match) {
      number = parseInt(match[1], 10);
      name = match[2].trim() || `ポスト ${number}`;
    }

    // -new をポスト名から除去して綺麗な表示名にする
    name = name.replace(/-new$/i, '').trim();

    const safeFilename = `qr-${ward.id}-${number}${ext}`;
    const srcFile = path.join(wardSourceDir, file);
    const destFile = path.join(wardTargetDir, safeFilename);

    // コピー
    fs.copyFileSync(srcFile, destFile);

    // 既存のJSONからcode, address, qrContent, scheduleを引き継ぐ
    const existingPost = existingPostsMap.get(`${ward.id}-${number}`);

    // 特別メタデータ定義 (29, 30番等の新規・補正)
    const customMetadata = {
      '3-29': {
        name: '守口市役所横',
        code: '570430',
        address: '守口市 京阪本通 2-5-5',
        qrContent: 'PST:01;CD1:570430;',
      },
      '3-30': {
        name: 'ローソン守口駅前店',
        code: '570712',
        address: '守口市 寺内町 2-1-6',
        qrContent: 'PST:01;CD1:570712;\r\n',
      },
    };

    // 平日第3区の収集時刻（全28箇所）
    const timetable3 = {
      1: { bin2: '10:10', bin3: '14:10' },
      2: { bin2: '10:13', bin3: '14:13' },
      3: { bin2: '10:16', bin3: '14:16' },
      4: { bin2: '10:19', bin3: '14:19' },
      5: { bin2: '10:22', bin3: '14:22' },
      6: { bin2: '10:25', bin3: '14:25', special: '17:00' },
      7: { bin2: '10:33', bin3: '14:33' },
      8: { bin2: '10:36', bin3: '14:36' },
      9: { bin2: '10:39', bin3: '14:39' },
      10: { bin2: '10:42', bin3: '14:42' },
      11: { bin2: '10:45', bin3: '14:45' },
      12: { bin2: '10:48', bin3: '14:48', special: '17:07' },
      13: { bin2: '10:56', bin3: '14:56' },
      14: { bin2: '10:59', bin3: '14:59' },
      15: { bin2: '11:02', bin3: '15:02' },
      16: { bin2: '11:05', bin3: '15:05' },
      17: { bin2: '11:08', bin3: '15:08' },
      18: { bin2: '11:11', bin3: '15:11' },
      19: { bin2: '11:14', bin3: '15:14' },
      20: { bin2: '11:17', bin3: '15:17' },
      21: { bin2: '11:25', bin3: '15:25', special: '17:14' },
      22: { bin2: '11:33', bin3: '15:33' },
      23: { bin2: '11:36', bin3: '15:36', special: '17:21' },
      24: { bin2: '11:44', bin3: '15:44' },
      25: { bin2: '11:57', bin3: '15:57' },
      26: { bin2: '12:00', bin3: '16:00' },
      27: { bin2: '12:03', bin3: '16:03' },
      28: { bin2: '12:06', bin3: '16:06' }
    };

    // 土日祝第3区の収集時刻（全30箇所、2便制：2号便10:00〜、3号便15:00〜、特便なし）
    const timetableHoliday3 = {
      1: { bin2: '10:00', bin3: '15:00' },
      2: { bin2: '10:03', bin3: '15:03' },
      3: { bin2: '10:06', bin3: '15:06' },
      4: { bin2: '10:09', bin3: '15:09' },
      5: { bin2: '10:12', bin3: '15:12' },
      6: { bin2: '10:15', bin3: '15:15' },
      7: { bin2: '10:23', bin3: '15:23' },
      8: { bin2: '10:26', bin3: '15:26' },
      9: { bin2: '10:29', bin3: '15:29' },
      10: { bin2: '10:32', bin3: '15:32' },
      11: { bin2: '10:35', bin3: '15:35' },
      12: { bin2: '10:38', bin3: '15:38' },
      13: { bin2: '10:46', bin3: '15:46' },
      14: { bin2: '10:49', bin3: '15:49' },
      15: { bin2: '10:52', bin3: '15:52' },
      16: { bin2: '10:55', bin3: '15:55' },
      17: { bin2: '10:58', bin3: '15:58' },
      18: { bin2: '11:01', bin3: '16:01' },
      19: { bin2: '11:04', bin3: '16:04' },
      20: { bin2: '11:07', bin3: '16:07' },
      21: { bin2: '11:15', bin3: '16:15' },
      22: { bin2: '11:23', bin3: '16:23' },
      23: { bin2: '11:26', bin3: '16:26' },
      24: { bin2: '11:34', bin3: '16:34' },
      25: { bin2: '11:47', bin3: '16:47' },
      26: { bin2: '11:50', bin3: '16:50' },
      27: { bin2: '11:53', bin3: '16:53' },
      28: { bin2: '11:56', bin3: '16:56' },
      29: { bin2: '12:01', bin3: '17:01' },
      30: { bin2: '12:05', bin3: '17:05' }
    };

    const postKey = `${ward.id}-${number}`;
    const extraMeta = customMetadata[postKey] || {};

    let schedule = existingPost?.schedule;
    if (ward.id === 3) {
      schedule = {
        weekday: timetable3[number],
        holiday: timetableHoliday3[number],
      };
    }

    wardPostsMap.set(number, {
      id: postKey,
      ward: ward.id,
      number: number,
      name: extraMeta.name || existingPost?.name || name,
      code: extraMeta.code || existingPost?.code,
      address: extraMeta.address || existingPost?.address,
      qrContent: extraMeta.qrContent || existingPost?.qrContent,
      originalFilename: file,
      imagePath: `/qr/${ward.id}/${safeFilename}`,
      schedule: schedule,
    });
  });

  const wardPosts = Array.from(wardPostsMap.values());
  // 番号順にソート
  wardPosts.sort((a, b) => a.number - b.number);
  allPosts.push(...wardPosts);
});

if (!fs.existsSync(dataOutputDir)) {
  fs.mkdirSync(dataOutputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(dataOutputDir, 'posts.json'),
  JSON.stringify(allPosts, null, 2),
  'utf-8'
);

console.log(`[Success] Synced ${allPosts.length} posts to public/qr and src/data/posts.json`);
