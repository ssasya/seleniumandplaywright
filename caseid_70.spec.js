const { test, expect } = require('@playwright/test');

test('caseid_70 - 스토어 : 마이와디즈의 구매내역 리스트 확인', async ({ page,isMobile }) => {
  if (isMobile){
    
    // -----------------------------------------
    // 1. 스토어 : 마이와디즈 나의 구매내역 진입 //
    // -----------------------------------------
    await page.goto('mywadiz/supporter');

    // 두 번째 자식 class locator 클릭
    await Promise.all([ //페이지 이동하여 API 로딩 대기
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.locator('.MyWadizSupporterProjectInfoCard_projectLink__3h13u > div:nth-of-type(2)').click()
    ]);

    // ----------------------------------------
    // 2. 스토어 : 스토어 나의 구매 리스트 확인 //
    // ----------------------------------------

    // 상품 리스트 API Json에 파싱
    const storebuyList = await page.request.get(`apip/store/orders/my?page=0&sortBy=REGISTERED_AT%2CDESC&size=10&filter=ALL`);
    expect(storebuyList.ok()).toBeTruthy();
    const storebuyList_result = await storebuyList.json();

    // API 응답에서 구매내역 title 배열 추출
    const buylist = storebuyList_result.data.content;
    const buylist_api = buylist.map(item => item.project.title);

    // 나의 구매 리스트에 잘 노출되는지 확인
    if (buylist_api && buylist_api.length > 0) {
      for (const list of buylist_api) {
        const list_Name = list;
        const countList = page.locator('.CardList_container__3JT0y', { hasText: list_Name });
        const count = await countList.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
          await expect(countList.nth(i)).toBeVisible();
        }
      }
    }
  }
});
