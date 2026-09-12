const { Jimp } = require('jimp');
const jsQR = require('jsqr');
const path = require('path');
const fs = require('fs');

async function decodeQR(filePath) {
  try {
    const image = await Jimp.read(filePath);
    const { data, width, height } = image.bitmap;
    const code = jsQR(new Uint8ClampedArray(data), width, height);
    if (code) {
      return code.data;
    }
    // もし検出できなかった場合、グレースケールやコントラスト調整
    image.greyscale().contrast(0.2);
    const code2 = jsQR(new Uint8ClampedArray(image.bitmap.data), image.bitmap.width, image.bitmap.height);
    if (code2) {
      return code2.data;
    }
    return null;
  } catch (err) {
    return 'ERROR: ' + err.message;
  }
}

async function run() {
  const dir = path.join(__dirname, '..', 'ポスト収集QRコード', '３区');
  const files = fs.readdirSync(dir).slice(0, 5); // 最初の5件

  for (const file of files) {
    const filePath = path.join(dir, file);
    const result = await decodeQR(filePath);
    console.log(`File: ${file} => QR Data:`, result);
  }
}

run();
