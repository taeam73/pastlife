export const AUDIO_LEVELS = {
  music: 0.29,
  choice: 0.58,
  writing: 0.28,
} as const;

export const experienceRoute = /^\/(?:$|guide$|question\/\d+$|analysis$|result$|final-moment$|deep$)/u;
