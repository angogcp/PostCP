const fs = require('fs');
const path = require('path');

// 3区の28件のメタデータ定義
const district3Data = [
  { number: 1, name: "宮本たばこ店", code: "570401", address: "守口市 京阪本通 1-2-10" },
  { number: 2, name: "関西医大病院（横）", code: "570433", address: "守口市 文園町 10-15" },
  { number: 3, name: "薬局横", code: "570405", address: "守口市 滝井西町 2-3-22" },
  { number: 4, name: "滝井元町３－１", code: "570406", address: "守口市 滝井元町 3-1-1" },
  { number: 5, name: "祝町９－１８", code: "570409", address: "守口市 祝町 9-18" },
  { number: 6, name: "守口土居郵便局前", code: "570410", address: "守口市 土居町 9-15" },
  { number: 7, name: "日吉町１－６", code: "570411", address: "守口市 日吉町 1-6" },
  { number: 8, name: "京阪本通メロディハイム", code: "570412", address: "守口市 京阪本通 2-12" },
  { number: 9, name: "守口警察署１号線向かい", code: "570413", address: "守口市 京阪本通 2-15" },
  { number: 10, name: "メイプル", code: "570414", address: "守口市 京阪北本通 2-1" },
  { number: 11, name: "リバーサイド横", code: "570415", address: "守口市 京阪北本通 3-6" },
  { number: 12, name: "北本通郵便局", code: "570416", address: "守口市 京阪北本通 1-13" },
  { number: 13, name: "京阪病院", code: "570417", address: "守口市 八雲中町 3-1-35" },
  { number: 14, name: "国道１号線大日町２", code: "570101", address: "守口市 大日町 2-1" },
  { number: 15, name: "佐太中町２－２４ 駐車場横", code: "570116", address: "守口市 佐太中町 2-24" },
  { number: 16, name: "大日東公園横", code: "570117", address: "守口市 大日東町 28" },
  { number: 17, name: "旧庭窪局", code: "570418", address: "守口市 八雲西町 1-22-1" },
  { number: 18, name: "横田酒店", code: "570419", address: "守口市 八雲北町 1-2" },
  { number: 19, name: "八雲北住宅", code: "570420", address: "守口市 八雲北町 3-1" },
  { number: 20, name: "ローソン守口八雲西町三丁目店", code: "570719", address: "守口市 八雲西町 3-1-3" },
  { number: 21, name: "八雲西郵便局前", code: "570434", address: "守口市 八雲西町 4-7-3" },
  { number: 22, name: "淀江町５－７", code: "570422", address: "守口市 淀江町 5-7" },
  { number: 23, name: "八雲東郵便局", code: "570423", address: "守口市 八雲東町 2-78-16" },
  { number: 24, name: "八雲東メロディハイム", code: "570424", address: "守口市 八雲東町 2-82-22" },
  { number: 25, name: "関西電力前", code: "570426", address: "守口市 八雲東町 2-1" },
  { number: 26, name: "柳田商店", code: "570427", address: "守口市 大日東町 15-4" },
  { number: 27, name: "盛泉寺", code: "570428", address: "守口市 大日町 1-8" },
  { number: 28, name: "ＭＩＤビル", code: "570429", address: "守口市 大日東町 1-1" }
];

const postsJsonPath = path.join(__dirname, '..', 'src', 'data', 'posts.json');
let posts = [];
if (fs.existsSync(postsJsonPath)) {
  posts = JSON.parse(fs.readFileSync(postsJsonPath, 'utf-8'));
}

// 既存の3区ポストにcode, qrContent, addressを付与
posts = posts.map(post => {
  if (post.ward === 3) {
    const meta = district3Data.find(d => d.number === post.number);
    if (meta) {
      return {
        ...post,
        name: meta.name,
        code: meta.code,
        address: meta.address,
        qrContent: `PST:01;CD1:${meta.code};`
      };
    }
  }
  return post;
});

fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), 'utf-8');
console.log('Successfully updated posts.json with accurate QR content and metadata!');
