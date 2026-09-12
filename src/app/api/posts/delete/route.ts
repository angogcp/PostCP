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
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { success: false, message: 'postIdが指定されていません' },
        { status: 400 }
      );
    }

    const postsJsonPath = path.join(process.cwd(), 'src', 'data', 'posts.json');
    if (fs.existsSync(postsJsonPath)) {
      let postsList: any[] = JSON.parse(fs.readFileSync(postsJsonPath, 'utf-8'));
      const target = postsList.find((p) => p.id === postId);

      if (target) {
        // 画像ファイルの削除（可能であれば）
        try {
          const publicImg = path.join(process.cwd(), 'public', target.imagePath);
          if (fs.existsSync(publicImg)) fs.unlinkSync(publicImg);

          if (target.originalFilename) {
            const originalImg = path.join(
              process.cwd(),
              'ポスト収集QRコード',
              `${target.ward}区`,
              target.originalFilename
            );
            if (fs.existsSync(originalImg)) fs.unlinkSync(originalImg);
          }
        } catch (e) {
          console.warn('File unlink error:', e);
        }

        // posts.json から除外
        postsList = postsList.filter((p) => p.id !== postId);
        fs.writeFileSync(postsJsonPath, JSON.stringify(postsList, null, 2), 'utf-8');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'ポストを削除しました',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { success: false, message: 'ポスト削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
