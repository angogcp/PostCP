import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, isValidSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import postsData from '@/data/posts.json';

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
    const postId = formData.get('postId') as string;
    const file = formData.get('file') as File;

    if (!postId || !file) {
      return NextResponse.json(
        { success: false, message: '必要なパラメータが不足しています' },
        { status: 400 }
      );
    }

    const post = (postsData as any[]).find((p) => p.id === postId);
    if (!post) {
      return NextResponse.json(
        { success: false, message: '指定されたポストが見つかりません' },
        { status: 404 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let savedLocally = false;
    try {
      // 1. public/qr/... のファイルを更新
      const targetPublicPath = path.join(process.cwd(), 'public', post.imagePath);
      fs.writeFileSync(targetPublicPath, buffer);

      // 2. ポスト収集QRコード/... の元ファイルも更新（存在する場合）
      if (post.originalFilename) {
        const wardFolder = `${post.ward}区`;
        const originalSourcePath = path.join(
          process.cwd(),
          'ポスト収集QRコード',
          wardFolder,
          post.originalFilename
        );
        fs.writeFileSync(originalSourcePath, buffer);
      }
      savedLocally = true;
    } catch (fsErr) {
      // Vercelなどの読み取り専用環境ではローカルファイル保存はスキップ
      console.warn('Filesystem write not supported in this environment, client-side fallback used', fsErr);
    }

    return NextResponse.json({
      success: true,
      message: '画像を正常に置き換えました',
      savedLocally,
    });
  } catch (error) {
    console.error('Image replace error:', error);
    return NextResponse.json(
      { success: false, message: '画像置き換え処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
