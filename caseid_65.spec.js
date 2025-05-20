const { test, expect } = require('@playwright/test');

test('caseid_65 - 스토어 : 상세 페이지 진입', async ({ page,isMobile }) => {
  if (isMobile){
    await page.goto('store/main/COLLECTION_musthave');
    await page.locator('.TabsMobile_tabsWrapper__1vzEm [data-text="전체"]').click();
  
    // -------------------------------------------------
    // 1. 스토어 홈 : 첫 번째 프로젝트 선택 후 상세 진입 //
    // -------------------------------------------------
    await Promise.all([ //페이지 이동하여 API 로딩 대기
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.locator('.HomeHorizontalCard_container__QBqLW').first().click()
    ]);

    // --------------------------------
    // 2. 스토어 상세 : 노출 정보 확인 //
    // --------------------------------

    // URL에서 스토어 프로젝트 번호 추출
    const match = page.url().match(/\/detail\/(\d+)/);
    if (!match) {
      throw new Error('URL에 프로젝트 번호가 없습니다.');
    }
    const [, projectNum] = match;


    // 프로젝트 정보 API 데이터 json에 파싱
    const storeProjectResponse = await page.request.get(`https://www.wadiz.kr/web/apip/store/projects/${projectNum}`);
    expect(storeProjectResponse.ok()).toBeTruthy();
    const projectJson = await storeProjectResponse.json();

    const projectinfo = projectJson.data;
    const projectTitle_API = projectinfo.title; // 프로젝트 이름
    const projectStatus_API = projectinfo.status; // 프로젝트 할인 상태

    const uiProjectTitle = await page.locator('.DetailInfoHeader_title__i0kaY').innerText();

    // 공백 제거 후 화면 프로젝트 명과 API title명 확인
    await expect(uiProjectTitle.trim()).toBe(projectTitle_API.trim());

    // API에서 할인율 status 상태가 ON_SALE 상태로 넘어온다면 실행
    if (projectStatus_API == "ON_SALE") {
      const discountText = await page.locator('.DetailInfoHeader_priceArea__3Y3xZ .DetailInfoHeader_discountRate__15CLK').innerText();

      // 할인율 노출 확인
      await expect(discountText.trim()).toMatch(/^\d+%$/);
    }
  }
});
