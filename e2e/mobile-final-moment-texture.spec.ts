import { expect, test } from '@playwright/test';

test('long final moment keeps the parchment texture behind all text', async ({ page }) => {
  await page.route('**/results/texture-check/final-moment', async (route) => {
    await route.fulfill({ json: {
      resultId: 'texture-check',
      storyId: 'TEXTURE_CHECK',
      protagonist: '하심',
      year: '1251년',
      place: '바그다드',
      scene: Array.from({ length: 12 }, (_, index) => `${index + 1}번째 장면. 딸이 내 이름을 부릅니다. 나는 고개를 돌리려 하지만 문이 흐려집니다. 이것은 긴 본문이 배경을 넘어가는지 확인하는 문장입니다.`).join('\n\n'),
      afterword: '전생록의 기록. '.repeat(100),
      illustration: { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9dL6SAAAAABJRU5ErkJggg==', alt: '시험 이미지' },
    } });
  });
  await page.route('**/results/texture-check/final-moment/read', async (route) => {
    await route.fulfill({ json: { resultId: 'texture-check', finalMomentRead: true, readAt: new Date().toISOString() } });
  });

  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/final-moment?resultId=texture-check');
    const parchment = page.getByTestId('final-moment-parchment');
    const texture = page.getByTestId('final-moment-texture');
    await expect(texture).toBeVisible();
    const parchmentBox = await parchment.boundingBox();
    const textureBox = await texture.boundingBox();
    expect(parchmentBox).not.toBeNull();
    expect(textureBox).not.toBeNull();
    expect(textureBox!.height).toBeGreaterThanOrEqual(parchmentBox!.height - 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});
