const { test, expect } = require('@playwright/test');

test('caseid_66 - 스토어 : 상세 페이지 스토리 노출 확인', async ({ page,isMobile }) => {
  if (isMobile){
  
    // -------------------------------------------------
    // 1. 스토어 홈 : 첫 번째 프로젝트 선택 후 상세 진입 //
    // -------------------------------------------------
    await page.goto('store/main/COLLECTION_musthave');
    await page.locator('.TabsMobile_tabsWrapper__1vzEm [data-text="전체"]').click();

    await Promise.all([ //페이지 이동하여 API 로딩 대기
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.locator('.HomeHorizontalCard_container__QBqLW').first().click()
    ]);

    // ---------------------------------------
    // 2. 스토어 상세 : 스토리 영역 노출 확인 //
    // ---------------------------------------

    // 페이지 최하단으로 이동
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const storyButton = await page.locator('[data-ga-label="스토리_더보기"]');
    if (await storyButton.count() > 0){ 
      await storyButton.click();
    }
    const storyDetail = await page.locator('.inner-contents p');
    await expect(storyDetail.first()).toBeVisible();
    const storyMorebutton = await page.locator('[data-ga-label="스토리_접기"]');
    await expect(storyMorebutton).toBeVisible();
  }
});
