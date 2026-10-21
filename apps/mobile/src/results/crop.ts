export type Crop = { focusX: number; focusY: number; zoom: number };

export function cropLayout(sourceWidth: number, sourceHeight: number, frameWidth: number, frameHeight: number, crop: Crop) {
  if (![sourceWidth, sourceHeight, frameWidth, frameHeight].every((value) => Number.isFinite(value) && value > 0)) return null;
  const scale = Math.max(frameWidth / sourceWidth, frameHeight / sourceHeight) * Math.max(1, crop.zoom);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const left = Math.max(frameWidth - width, Math.min(0, frameWidth / 2 - Math.min(1, Math.max(0, crop.focusX)) * width));
  const top = Math.max(frameHeight - height, Math.min(0, frameHeight / 2 - Math.min(1, Math.max(0, crop.focusY)) * height));
  return { width, height, left, top };
}
