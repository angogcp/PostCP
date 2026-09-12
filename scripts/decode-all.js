const { Jimp } = require('jimp');
const jsQR = require('jsqr');
const path = require('path');
const fs = require('fs');

async function decodeQR(filePath) {
  try {
    const image = await Jimp.read(filePath);
    let { data, width, height } = image.bitmap;
    let code = jsQR(new Uint8ClampedArray(data), width, height);
    if (code) return code.data;

    // コントラスト上げて再試行
    image.greyscale().contrast(0.4);
    code = jsQR(new Uint8ClampedArray(image.bitmap.data), image.bitmap.width, image.bitmap.height);
    if (code) return code.data;

    // リサイズして再試行
    image.resize({ w: Math.round(image.bitmap.width / 2), h: Math.round(image.bitmap.height / 2) });
    code = jsQR(new Uint8ClampedArray(image.bitmap.data), image.bitmap.width, image.bitmap.height);
    if (code) return code.data;

    return null;
  } catch (err) {
    return 'ERROR: ' + err.message;
  }
}

async function run() {
  const dir = path.join(__dirname, '..', 'ポスト収集QRコード', '３区');
  const files = fs.readdirSync(dir);
  const results = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
    const filePath = path.join(dir, file);
    const data = await decodeQR(filePath);
    results.push({ file, qrData: data });
    console.log(`${file} => ${data}`);
  }

  fs.writeFileSync(
    path.join(__dirname, 'decode_results.json'),
    JSON.stringify(results, null, 2),
    'utf-8'
  );
}

run();
