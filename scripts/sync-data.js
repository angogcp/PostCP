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
  const wardPosts = [];

  files.forEach((file) => {
    // 拡張子のチェック
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return;

    // ファイル名から番号と名称を取得 (例: "1. 宮本たばこ店.jpg", "10. メイプル.jpg")
    const baseName = path.basename(file, ext).trim();
    const match = baseName.match(/^(\d+)[\.\s　]*(.*)$/);

    let number = 0;
    let name = baseName;

    if (match) {
      number = parseInt(match[1], 10);
      name = match[2].trim() || `ポスト ${number}`;
    }

    const safeFilename = `qr-${ward.id}-${number}${ext}`;
    const srcFile = path.join(wardSourceDir, file);
    const destFile = path.join(wardTargetDir, safeFilename);

    // コピー
    fs.copyFileSync(srcFile, destFile);

    // 既存のJSONからcodeやqrContentがあれば引き継ぐ
    const existingPost = existingPostsMap.get(`${ward.id}-${number}`);

    wardPosts.push({
      id: `${ward.id}-${number}`,
      ward: ward.id,
      number: number,
      name: name,
      code: existingPost?.code,
      address: existingPost?.address,
      qrContent: existingPost?.qrContent,
      originalFilename: file,
      imagePath: `/qr/${ward.id}/${safeFilename}`,
    });
  });

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
