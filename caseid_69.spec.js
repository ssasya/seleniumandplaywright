const { test, expect } = require('@playwright/test');

test('caseid_67 - 스토어 : 선물하기 카드 선택 페이지 이동 확인', async ({ page,isMobile }) => {
  if (isMobile){
    
    // -------------------------------------------------
    // 1. 스토어 홈 : 첫 번째 프로젝트 선택 후 상세 진입 //
    // -------------------------------------------------
    await page.goto('store/main?order=recommend');

    await Promise.all([ //페이지 이동하여 API 로딩 대기
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.locator('.HomeHorizontalCard_container__QBqLW').first().click()
    ]);

    // URL에서 스토어 프로젝트 번호 추출
    const match = page.url().match(/\/detail\/(\d+)/);
    if (!match) {
      throw new Error('URL에 프로젝트 번호가 없습니다.');
    }
    const [, projectNum] = match;

    // 상품 리스트 API Json에 파싱
    const product = await page.request.get(`apip/store/projects/${projectNum}/products`);
    expect(product.ok()).toBeTruthy();
    const product_list = await product.json();

    // ------------------------------------
    // 2. 스토어 상세 : 선물하기 버튼 선택 //
    // ------------------------------------
    const giftButton = await page.locator('.StoreGiftButton_container__2CE5f');
    await expect(giftButton).toBeVisible();
    await page.locator('.StoreGiftButton_container__2CE5f').click();

    // 첫 번째 상품 선택
    await page.locator('.ProductSelectMenuItem_container__2ubAS').first().click();

    // 구매 확인 모달에서 선택한 상품이 잘 노출되는지.
    const productListModal = await page.locator('.ProductSelectCard_title__3f3ww').first();
    await expect(productListModal).toBeVisible();
    
    // product_list API 응답 배열이 비어있지 않으면
    if (product_list && product_list.length > 0) {
        // 첫 번째 상품의 name을 추출합니다.
        const firstProductName = product_list[0].name;
        // 구매 확인 모달에서 선택한 상품 노출 확인
        await expect(productListModal).toContainText(firstProductName);
    }

    // ---------------------------------------
    // 4. 스토어 상세 : 결제 페이지 노출 확인 //
    // ---------------------------------------
    await page.locator('[data-ga-label="선물하기"]').click();    

    // 선물 카드 선택 컨테이너 노출 확인
    const giftcartContainer = await page.locator('.GiftMessageCard_container__rGuEq');
    await expect(giftcartContainer).toBeVisible();

    // 선물 받는 분 정보 컨테이너 노출 확인
    const giftaddress = await page.locator('.GiftRecipient_container__2PbFF');
    await expect(giftaddress).toBeVisible();

    const selectgiftProduct = await page.locator('.StorePaymentProductInfo_contents__19yTI');
    await expect(selectgiftProduct).toBeVisible();

    // product_list API 응답 배열이 비어있지 않으면
    if (product_list && product_list.length > 0) {
      // 첫 번째 상품의 name을 추출합니다.
      const selectProductName = product_list[0].name;
      // 구매 확인 모달에서 선택한 상품 노출 확인
      await expect(selectgiftProduct).toContainText(selectProductName);
    }
  }
});
