import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

// Gunakan process.cwd() = root project, bukan __dirname (yang berubah di dist/)
// Ini memastikan direktori uploads selalu di /project-root/public/uploads
// dan tidak hilang saat npm run build
const uploadDir = join(process.cwd(), 'public', 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@Controller('upload')
export class UploadController {
  /**
   * POST /api/upload
   * Terima hingga 10 file sekaligus (gambar max 10MB, video max 25MB),
   * simpan ke public/uploads, kembalikan array URL permanen.
   */
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const isImage = file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/);
        const isVideo = file.mimetype.match(/^video\/(mp4|webm|quicktime)$/);
        if (!isImage && !isVideo) {
          return cb(
            new BadRequestException('Hanya file gambar atau video yang diizinkan'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB (video); gambar dicek 10MB di handler
    }),
  )
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Tidak ada file yang dikirim');
    }

    // multer hanya punya satu limit global — cek gambar 10MB manual
    const oversized = files.find(
      (f) => f.mimetype.startsWith('image/') && f.size > 10 * 1024 * 1024,
    );
    if (oversized) {
      for (const f of files) {
        try {
          unlinkSync(f.path);
        } catch {
          // sudah tidak ada — abaikan
        }
      }
      throw new BadRequestException('Gambar maksimal 10MB');
    }

    const baseUrl = process.env.BACKEND_URL ?? 'http://localhost:3001';
    const urls = files.map((f) => `${baseUrl}/uploads/${f.filename}`);
    return { urls };
  }
}
