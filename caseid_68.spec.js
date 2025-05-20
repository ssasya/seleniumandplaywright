const { test, expect } = require('@playwright/test');

test('caseid_68 - 스토어 : 상세 페이지 진입 후 상품 선택하여 결제 상세 페이지 진입', async ({ page,isMobile }) => {
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

    // -----------------------------------------------------------
    // 2. 스토어 상세 : 구매하기 버튼 동작 및 상품 리스트 노출 확인 //
    // -----------------------------------------------------------
    await page.locator('.ProductChoiceContainerWrapMobile_buttonWrap__1V8Vj').click();
    

    // 구매하기 모달 내에 다운로드 가능한 할인쿠폰 노출 확인
    if (product_list && product_list.length > 0) {
      for (const storeProduct of product_list) {
        const productName = storeProduct.name;
        // Name을 포함하는 모든 요소 선택
        const productElements = page.locator('.ProductSelect_container__1Xa66', { hasText: productName });
        const count = await productElements.count();
        // productName에 해당하는 요소가 하나 이상 존재하는지 확인
        expect(count).toBeGreaterThan(0);
        // 모든 매칭 요소 각각에 대해 노출 여부 검증
        for (let i = 0; i < count; i++) {
          await expect(productElements.nth(i)).toBeVisible();
        }
      }
    }

    // ------------------------------------------------------
    // 3. 스토어 상세 : 상품 선택 후 구매 확인 모달 동작 확인 //
    // ------------------------------------------------------

    // 첫 번째 상품 선택
    await page.locator('.ProductSelectMenuItem_container__2ubAS').first().click();

    // 옵션이 있는지 확인 (두 번째, 세 번째 옵션 여부는 추후 오류가 발생되면 확인..)
    const optionContent = page.locator('.ProductSelectOptionMenu_content__3rdT0').first();
    
    if (await optionContent.isVisible()) {
      await optionContent.click();
    }
    
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
    await page.locator('[data-ga-label="구매하기"]').click();

    const selectProduct = await page.locator('.StorePaymentProductInfo_contents__19yTI');
    await expect(selectProduct).toBeVisible();
    // product_list API 응답 배열이 비어있지 않으면
    if (product_list && product_list.length > 0) {
      // 첫 번째 상품의 name을 추출합니다.
      const selectProductName = product_list[0].name;
      // 구매 확인 모달에서 선택한 상품 노출 확인
      await expect(selectProduct).toContainText(selectProductName);
    }

    // 결제하기 버튼 노출 확인
    const paymentButton = page.locator('.StorePaymentCTA_buttonContent__MRy-k');
    await expect(paymentButton).toBeVisible();

    // -----------------------------
    // 5. 스토어 결제 페이지 : 결제 진행 //
    // -----------------------------

    // 간편결제 라디오 버튼 선택
    await page.locator('.SettlementMethod_horizontal__13Pcl').first().click();
    // 저장된 간편결제 카드 노출 확인
    await expect(page.locator('.SimplePayCard_card__34Qn0')).toBeVisible();
    // 결제하기 버튼 선택
    await page.locator('.StorePaymentCTA_prevPrice__2GuHF').click();
    //결제 진행 필수 동의 진행
    await page.locator('.PaymentTerms_header__3b9IM Checkbox_md__2hsV2').click();
    

  }
});
