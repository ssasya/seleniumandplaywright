const { test, expect } = require('@playwright/test');

test('caseid_67 - 스토어 : 상세 페이지에 바로 사용 가능한 할인 쿠폰 보기 버튼 확인', async ({ page,isMobile }) => {
  if (isMobile){
    
    // -------------------------------------------------
    // 1. 스토어 홈 : 첫 번째 프로젝트 선택 후 상세 진입 //
    // -------------------------------------------------
    await page.goto('store/main?order=recommend');

    await Promise.all([ //페이지 이동하여 API 로딩 대기
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.locator('.HomeHorizontalCard_container__QBqLW').first().click()
    ]);

    const couponsButton = await page.locator('.AvailableCouponButton_button__3JH3v');
    await expect(couponsButton).toBeVisible();

    await page.locator('.AvailableCouponButton_button__3JH3v').click();

    // URL에서 스토어 프로젝트 번호 추출
    const match = page.url().match(/\/detail\/(\d+)/);
    if (!match) {
      throw new Error('URL에 프로젝트 번호가 없습니다.');
    }
    const [, projectNum] = match;


    // ---------------------------------------------------------------------------
    // 2. 스토어 : 상세 페이지 바로 사용 가능한 할인 쿠폰 보기 버튼 동작 및 모달 확인 //
    // ---------------------------------------------------------------------------

    // 현재 프로젝트에서 사용가능한 다운로드 쿠폰 리스트 API 데이터 json에 파싱
    const downloadCoupon = await page.request.get(`reward/api/coupons/templates/types/download?onlyEffectedDate=true&onlyEffectedQty=true&excludeRedeemedIfLoggedIn=true&targetType=STORE&targetKey=${projectNum}`);
    expect(downloadCoupon.ok()).toBeTruthy();
    const downloadCoupon_list = await downloadCoupon.json();

    // 해당 프로젝트에서 사용 가능한 보유한 쿠폰 리스트 API 데이터 json에 파싱
    const useableCoupon = await page.request.get(`reward/api/coupons/owners/my?usable=true&checkDeviceCondition=false&targetType=STORE&targetKey=${projectNum}`);
    expect(useableCoupon.ok()).toBeTruthy();
    const useableCoupon_list = await useableCoupon.json();

    // 쿠폰 모달 내에 다운로드 가능한 할인쿠폰 노출 확인
    if (downloadCoupon_list && downloadCoupon_list.length > 0) {
        for (const coupon of downloadCoupon_list) {
          const couponName = coupon.couponName;
          // couponName을 포함하는 모든 요소 선택
          const couponElements = page.locator('.ConfirmModal_content__2jN__ .CouponItem_container__1wXTd', { hasText: couponName });
          const count = await couponElements.count();
          // couponName에 해당하는 요소가 하나 이상 존재하는지 확인
          expect(count).toBeGreaterThan(0);
          // 모든 매칭 요소 각각에 대해 노출 여부 검증
          for (let i = 0; i < count; i++) {
            await expect(couponElements.nth(i)).toBeVisible();
          }
        }
      }

      // 쿠폰 모달 내에 보유한 쿠폰 리스트 노출 확인
      if (useableCoupon_list && useableCoupon_list.length > 0) {
        for (const coupon of useableCoupon_list) {
          const couponName = coupon.couponName;
          // couponName을 포함하는 모든 요소 선택
          const couponElements = page.locator('.ConfirmModal_content__2jN__ .CouponItem_container__1wXTd', { hasText: couponName });
          const count = await couponElements.count();
          // couponName에 해당하는 요소가 하나 이상 존재하는지 확인
          expect(count).toBeGreaterThan(0);
          // 모든 매칭 요소 각각에 대해 노출 여부 검증
          for (let i = 0; i < count; i++) {
            await expect(couponElements.nth(i)).toBeVisible();
          }
        }
      }
  }
});
