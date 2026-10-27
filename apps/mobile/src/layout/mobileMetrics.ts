export type MobileMetrics = {
  gutter: number;
  logoWidth: number;
  logoHeight: number;
  contentMaxWidth: number;
};

export function mobileMetrics(width: number, fontScale: number): MobileMetrics {
  const compact = width <= 360 || fontScale > 1.15;
  return {
    gutter: compact ? 14 : 20,
    logoWidth: compact ? 84 : 94,
    logoHeight: compact ? 30 : 35,
    contentMaxWidth: 760,
  };
}
