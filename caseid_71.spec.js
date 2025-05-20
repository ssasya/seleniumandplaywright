const { test, expect } = require('@playwright/test');

test('caseid_71 - 스토어 : 마이와디즈 구매내역 상세 확인', async ({ page,isMobile }) => {
  if (isMobile){
    
    // -----------------------------------------
    // 1. 스토어 : 마이와디즈 나의 구매내역 진입 //
    // -----------------------------------------
    await Promise.all([ //페이지 이동하여 API 로딩 대기
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.goto('mywadiz/store/order')
    ]);

    // 상품 리스트 API Json에 파싱(orderNo를 받기 위해)
    const storebuyList = await page.request.get(`apip/store/orders/my?page=0&sortBy=REGISTERED_AT%2CDESC&size=10&filter=ALL`);
    expect(storebuyList.ok()).toBeTruthy();
    const storebuyList_result = await storebuyList.json();
    const orderNo_first = storebuyList_result.data.content[0].orderNo;
    const orderName = storebuyList_result.data.content[0].project.title;
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      await page.locator('.PurchaseSummaryCard_item__3Wq1e').first().click()
    ]);
    
    // ----------------------------------------
    // 2. 스토어 : 스토어 나의 구매 리스트 확인 //
    // ----------------------------------------

    // 
    const fullorder_View =  await page.locator('.OrderDetailPage_cardInfoArea__29mmy').innerText()
    const matchNo = fullorder_View.match(/주문번호\s*:?\s*(.+)/);
    const orderNo_View = matchNo ? matchNo[1].trim() : "";
    expect(orderNo_View).toBe(orderNo_first);

    // 상품 리스트 API Json에 파싱(orderNo를 받기 위해)
    const payData = await page.request.get(`apip/store/orders/${orderNo_first}`);
    expect(payData.ok()).toBeTruthy();
    const payData_result = await payData.json();
    
    // 참여한 프로젝트명 확인
    const fullorderName_View =  await page.locator('.PurchaseDetailHeaderCard_title__oNJwo').innerText();
    expect(fullorderName_View.trim()).toBe(orderName);

    const productPrice = payData_result.data.bill.productAmount;
    const shippingCharge = payData_result.data.bill.shippingCharge;
    const extrashippingCharge = payData_result.data.bill.extraShippingCharge;
    const shippingSupportAmount = payData_result.data.bill.shippingSupportAmount;
    const amount = payData_result.data.orderLines[0].product.amount;
    const optionName = payData_result.data.orderLines[0].product.name;
    const optionValue_First = payData_result.data.orderLines[0].optionCombination.options[0].value;
    const optionValue_Second = payData_result.data.orderLines[0].optionCombination.options[1].value;
    const optionValue_Count = payData_result.data.orderLines[0].qty;
    console.log(`amount : ${amount}`);

    // 상품 금액 노출 확인
    const productPrice_View =  await page.locator('.LabelValueList_alignRight__1bKDa').first().innerText();
    const numericProductPrice = parseInt(productPrice_View.replace(/[^0-9]/g, ''));
    expect(numericProductPrice).toBe(productPrice);

    // 총 배송비 확인
    const elements = page.locator('.OrderDetailPage_supporterClubDiscount__28bWX');
    const count = await elements.count();
    let targetElement;
    if (count > 1) {
      targetElement = elements.nth(1);
    } else {
      targetElement = elements.first();
    }
    const totalShipping_View = await targetElement.innerText();
    const numerictotalShipping = parseInt(totalShipping_View.replace(/[^0-9]/g, ''));
    expect(numerictotalShipping).toBe((shippingCharge+extrashippingCharge)-shippingSupportAmount);

    // 상품 정보 확인
    const optionName_View =  await page.locator('.OrderCard_title__1MkIL').innerText();
    expect(optionName_View).toBe(optionName);
    const option_View =  await page.locator('.OrderCard_option__1ml1Z').innerText();
    expect(option_View).toBe(`${optionValue_First} / ${optionValue_Second} , ${optionValue_Count}개`);
    const amount_View =  await page.locator('.OrderCard_price__3RX7V').first().innerText();
    const numbericeAmount_View = parseInt(amount_View.replace(/[^0-9]/g, ''));
    expect(numbericeAmount_View).toBe(amount);
  }
});
