const { test, expect } = require('@playwright/test');

test('caseid_64 - 스토어 : 스토어 홈 카테고리 및 스토어 프로젝트 노출 검증', async ({ page,isMobile }) => {
  if (isMobile){
    // Wadiz 메인 페이지로 이동
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    if (await page.isVisible('.CouponBanner_banner__2NVMF')){
        await page.click('.CouponBanner_cancelIcon__2TQRk');
    } else if (await page.isVisible('.ProjectBanner_banner__HvGF7')){
        await page.click('.ProjectBanner_cancelIcon__1gxA3');
    }
    
    await page.click('.MainShortCutItem_icon16__1mcb_');
    
    // -----------------------
    // 1. 카테고리 영역 검증 //
    // -----------------------

    // 카테고리 API 데이터 json에 파싱
    const categoryResponse = await page.request.get("https://service.wadiz.kr/api/search/v3/categories/service-home?type=STORE");
    expect(categoryResponse.ok()).toBeTruthy();
    const categoryJson = await categoryResponse.json();

    // API 응답에서 카테고리 배열 추출
    const categories = categoryJson.data;
    const categoryNames_api = categories.map(category => category.categoryName);
    console.log("카테고리 이름 배열:", categoryNames_api);

    await page.waitForTimeout(1500);
    
    // 컨테이너 내에 있는 모든 카테고리 이름 요소 선택
    const categoryElements = page.locator('.ServiceHomeCategory_tabsContent__5azSM .ImageTab_label__3DEjf');
    // 모든 요소의 텍스트를 배열 형태로 가져옴
    const renderedCategoryNames = await categoryElements.allTextContents();
    console.log("화면에 렌더링된 카테고리 이름들:", renderedCategoryNames);

    // API 데이터의 각 카테고리 이름이 화면에 포함되어 있는지 확인
    for (const category_api of categoryNames_api) {
        await expect(renderedCategoryNames).toContain(category_api);
  }

    // -----------------------------
    // 2. 스토어 프로젝트 영역 검증 //
    // -----------------------------

    // API 호출하여 스토어 프로젝트 데이터 가져오기
    const storeResponse = await page.request.post("/api/search/store", {
        data: {
          "startNum": 0,
          "limit": 48,
          "order": "recommend",
          "isWaDelivery": false,
          "isMakerClub": false,
          "categoryAndLabels": ["COLLECTION_musthave"]
        }
      });

    expect(storeResponse.ok()).toBeTruthy();
    const storeJson = await storeResponse.json();

    // API > 프로젝트 title consol에 출력
    const stores = storeJson.data.list;
    stores.forEach(store => {
        console.log("프로젝트 이름: ", store.title);
    });
    
    for (const store of stores) {
    // 각 store 객체의 title  화면의 텍스트를 비교하여 화면에 잘 뿌려지는지 확인
    await expect(page.locator('.ServiceHomeCardList_container__2MI9A')).toContainText(store.title);
    }
  }
});
