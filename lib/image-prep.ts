/**
 * Browser-side preparation of a page photo before upload: downscale and
 * re-encode oversized photos (smaller upload, fits the size limits) and flag
 * clearly blurry or dark shots. Client only -- needs canvas.
 *
 * Fails open everywhere: if the browser can't decode the file (HEIC outside
 * Safari, say) the original is uploaded untouched with no warning.
 */

import { MAX_EDGE, fitWithin, qualityWarning, toGray } from "@/lib/image-quality";

const JPEG_QUALITY = 0.85;
/** Photos under this and already within MAX_EDGE are left alone. */
const SKIP_BELOW_BYTES = 800 * 1024;
const ANALYSIS_EDGE = 640;

export interface PreparedImage {
  file: File;
  warning: string | null;
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  try {
    // from-image applies EXIF rotation, so phone photos come out upright.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    try {
      // Quality check on a small copy: fast, and blur scores stay comparable.
      const probe = fitWithin(bitmap.width, bitmap.height, ANALYSIS_EDGE);
      const pc = document.createElement("canvas");
      pc.width = probe.width;
      pc.height = probe.height;
      const pctx = pc.getContext("2d", { willReadFrequently: true });
      let warning: string | null = null;
      if (pctx) {
        pctx.drawImage(bitmap, 0, 0, probe.width, probe.height);
        const { data } = pctx.getImageData(0, 0, probe.width, probe.height);
        warning = qualityWarning(toGray(data), probe.width, probe.height);
      }

      const target = fitWithin(bitmap.width, bitmap.height, MAX_EDGE);
      if (!target.scaled && file.size < SKIP_BELOW_BYTES) return { file, warning };

      const canvas = document.createElement("canvas");
      canvas.width = target.width;
      canvas.height = target.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return { file, warning };
      ctx.drawImage(bitmap, 0, 0, target.width, target.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
      );
      // Keep the original if re-encoding didn't help.
      if (!blob || blob.size >= file.size) return { file, warning };

      const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
      return { file: new File([blob], name, { type: "image/jpeg" }), warning };
    } finally {
      bitmap.close();
    }
  } catch {
    return { file, warning: null };
  }
}
