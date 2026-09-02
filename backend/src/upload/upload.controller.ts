import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join, basename } from 'path';
import { existsSync, mkdirSync, unlinkSync, readFileSync } from 'fs';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/** Cari direktori uploads yang valid di berbagai environment */
export function getUploadDir(): string {
  const possiblePaths = [
    join(process.cwd(), 'public', 'uploads'),
    join(process.cwd(), 'backend', 'public', 'uploads'),
    join(__dirname, '..', '..', 'public', 'uploads'),
    join(__dirname, '..', '..', '..', 'public', 'uploads'),
  ];
  for (const p of possiblePaths) {
    if (existsSync(p)) return p;
  }
  const defaultPath = join(process.cwd(), 'public', 'uploads');
  mkdirSync(defaultPath, { recursive: true });
  return defaultPath;
}

/** Validasi magic bytes file sesuai MIME type — cegah upload file palsu */
function validateMagicBytes(buf: Buffer, mimeType: string): boolean {
  const header = buf.slice(0, 8).toString('hex');
  const signatures: Record<string, string[]> = {
    'image/jpeg': ['ffd8ff'],
    'image/png': ['89504e47'],
    'image/webp': ['52494646'],
    'image/gif': ['47494638'],
    'video/mp4': ['00000018', '0000001c', '00000020', '66747970'],
    'video/webm': ['1a45dfa3'],
    'video/quicktime': ['00000018', '66747970'],
  };
  return signatures[mimeType]?.some((sig) => header.startsWith(sig)) ?? false;
}

@Controller('upload')
export class UploadController {
  /**
   * POST /api/upload
   * Terima hingga 10 file sekaligus (gambar max 10MB, video max 25MB),
   * simpan ke public/uploads, kembalikan array URL permanen.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, getUploadDir());
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
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

    // Validasi magic bytes — cegah file palsu (exe renamed jadi .png)
    for (const f of files) {
      try {
        const buf = readFileSync(f.path);
        if (!validateMagicBytes(buf, f.mimetype)) {
          // Hapus semua file yang sudah terlanjur di-upload
          for (const g of files) {
            try { unlinkSync(g.path); } catch { /* ignore */ }
          }
          throw new BadRequestException(
            `File "${f.originalname}" tidak valid — format tidak sesuai dengan ekstensi`,
          );
        }
      } catch (err: any) {
        // Bersihkan file jika error validasi
        for (const g of files) {
          try { unlinkSync(g.path); } catch { /* ignore */ }
        }
        if (err instanceof BadRequestException) throw err;
        throw new BadRequestException('Gagal memvalidasi file');
      }
    }

    const urls = files.map((f) => `/uploads/${f.filename}`);
    return { urls };
  }

  /** GET /api/upload/:filename — Public static stream fallback */
  @Get(':filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    // Sanitasi: ambil hanya nama file tanpa path apapun (cegah path traversal)
    // Contoh: "../../.env" → ".env" → tidak akan match file upload yang valid
    const safeFilename = basename(filename);
    if (!safeFilename || safeFilename !== filename || safeFilename.startsWith('.')) {
      throw new BadRequestException('Nama file tidak valid');
    }

    const dir = getUploadDir();
    const filePath = join(dir, safeFilename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File tidak ditemukan');
    }
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.sendFile(filePath);
  }
}

/** Melayani /api/uploads/:filename secara langsung */
@Controller('uploads')
export class UploadsPublicController {
  @Get(':filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    // Sanitasi: ambil hanya nama file tanpa path apapun (cegah path traversal)
    const safeFilename = basename(filename);
    if (!safeFilename || safeFilename !== filename || safeFilename.startsWith('.')) {
      throw new BadRequestException('Nama file tidak valid');
    }

    const dir = getUploadDir();
    const filePath = join(dir, safeFilename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File tidak ditemukan');
    }
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.sendFile(filePath);
  }
}

