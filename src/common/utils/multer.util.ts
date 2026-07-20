import { Request } from "express";
import { mkdirSync } from "fs";
import { extname, join } from "path";
import { diskStorage } from "multer";
import { BadRequestException, mixin } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

export type CallbackDestination = (
  error: Error | null,
  destination: string,
) => void;
export type CallbackFileName = (error: Error | null, filename: string) => void;
export type MulterFile = Express.Multer.File;

export function multerDestination(fieldName: string) {
  return function (
    req: Request,
    file: MulterFile,
    callback: CallbackDestination,
  ): void {
    let path = join("public", "uploads", fieldName);
    mkdirSync(path, { recursive: true });
    callback(null, path);
  };
}

export function multerFileName(
  req: Request,
  file: MulterFile,
  callback: CallbackFileName,
) {
  const ext = extname(file.originalname).toLowerCase();

  if (!isValidImageFormat(ext)) {
    callback(new Error("فرمت تصویر انتخاب شده باید از نوع jpg و png باشد"), "");
    return;
  }

  const fileName = `${Date.now()}${ext}`;
  callback(null, fileName);
}

function isValidImageFormat(ext: string) {
  return [".png", ".jpg", ".jpeg"].includes(ext);
}

export function MulterStorage(folderName: string) {
  return diskStorage({
    destination: multerDestination(folderName),
    filename: multerFileName,
  });
}

export function UploadFile(fieldName: string, folderName: string = "images") {
  return mixin(
    FileInterceptor(fieldName, {
      storage: MulterStorage(folderName),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              "فقط فرمت‌های jpg، jpeg و png پشتیبانی می‌شوند",
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  );
}
