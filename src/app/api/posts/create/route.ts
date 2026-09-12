import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, isValidSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!isValidSession(token)) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      );
    }
    const formData = await request.formData();
    const wardStr = formData.get('ward') as string;
    const numberStr = formData.get('number') as string;
    const name = (formData.get('name') as string)?.trim();
    const code = (formData.get('code') as string)?.trim() || undefined;
    const address = (formData.get('address') as string)?.trim() || undefined;
    const file = formData.get('file') as File;

    if (!wardStr || !numberStr || !name || !file) {
      return NextResponse.json(
        { success: false, message: 'すべての必須項目を入力してください' },
        { status: 400 }
      );
    }

    const ward = parseInt(wardStr, 10);
    const number = parseInt(numberStr, 10);

    if (isNaN(ward) || isNaN(number) || number <= 0) {
      return NextResponse.json(
        { success: false, message: '区またはポスト番号が不正です' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 拡張子の取得（元の拡張子または .jpg）
    const extName = path.extname(file.name).toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(extName) ? extName : '.jpg';

    const safeFilename = `qr-${ward}-${number}${safeExt}`;
    const originalFilename = `${number}. ${name}${safeExt}`;
    const imagePath = `/qr/${ward}/${safeFilename}`;
    const postId = `${ward}-${number}`;
    const qrContent = code ? `PST:01;CD1:${code};` : undefined;

    const newPost = {
      id: postId,
      ward,
      number,
      name,
      code,
      address,
      qrContent,
      originalFilename,
      imagePath,
    };

    let savedLocally = false;

    try {
      // 1. public/qr/${ward} ディレクトリ確認 & 保存
      const publicWardDir = path.join(process.cwd(), 'public', 'qr', String(ward));
      if (!fs.existsSync(publicWardDir)) {
        fs.mkdirSync(publicWardDir, { recursive: true });
      }
      fs.writeFileSync(path.join(publicWardDir, safeFilename), buffer);

      // 2. ポスト収集QRコード/${ward}区 ディレクトリ確認 & 元ファイル保存
      const sourceWardDir = path.join(process.cwd(), 'ポスト収集QRコード', `${ward}区`);
      if (!fs.existsSync(sourceWardDir)) {
        fs.mkdirSync(sourceWardDir, { recursive: true });
      }
      fs.writeFileSync(path.join(sourceWardDir, originalFilename), buffer);

      // 3. src/data/posts.json の更新
      const postsJsonPath = path.join(process.cwd(), 'src', 'data', 'posts.json');
      let postsList: any[] = [];
      if (fs.existsSync(postsJsonPath)) {
        postsList = JSON.parse(fs.readFileSync(postsJsonPath, 'utf-8'));
      }

      // 重複チェック（同一IDがあれば更新、なければ追加）
      const existingIndex = postsList.findIndex((p) => p.id === postId);
      if (existingIndex >= 0) {
        postsList[existingIndex] = newPost;
      } else {
        postsList.push(newPost);
      }

      // 区順・番号順にソート
      postsList.sort((a, b) => {
        if (a.ward !== b.ward) return a.ward - b.ward;
        return a.number - b.number;
      });

      fs.writeFileSync(postsJsonPath, JSON.stringify(postsList, null, 2), 'utf-8');
      savedLocally = true;
    } catch (fsErr) {
      console.warn('File write skipped in read-only environment', fsErr);
    }

    return NextResponse.json({
      success: true,
      message: 'ポストを正常に登録しました',
      post: newPost,
      savedLocally,
    });
  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json(
      { success: false, message: 'ポスト登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
