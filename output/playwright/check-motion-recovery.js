async (page) => {
  const failures = [];
  const errors = [];
  page.on('response', response => { if (response.status() >= 400 && response.url().includes('/_next/')) failures.push({url:response.url(),status:response.status()}); });
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({width:1440,height:900});
  const response = await page.goto('http://127.0.0.1:3000', {waitUntil:'networkidle'});
  await page.waitForSelector('[data-scroll-motion="ready"], [data-scroll-motion="reduced"]');
  const state = await page.locator('main').getAttribute('data-scroll-motion');
  const visibleMotion = [];
  const bridges = await page.locator('[data-motion-bridge]').count();
  if (state === 'reduced') await page.emulateMedia({reducedMotion:'no-preference'});
  for (let index=0;index<bridges;index++) {
    const bridge = page.locator('[data-motion-bridge]').nth(index);
    const top = await bridge.evaluate(element => element.getBoundingClientRect().top+scrollY);
    const samples = [];
    for (const position of [top-720,top-420,top-720]) {
      await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),position);
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      samples.push(await bridge.evaluate(element => ({progress:element.style.getPropertyValue('--bridge'),opacity:getComputedStyle(element.querySelector('.bridge-surface--to')).opacity,transform:getComputedStyle(element.querySelector('.bridge-ribbon')).transform})));
    }
    if (samples[0].progress===samples[1].progress || JSON.stringify(samples[0])!==JSON.stringify(samples[2])) throw new Error(`Transition ${index} did not animate and reverse`);
    visibleMotion.push({kind:await bridge.getAttribute('data-motion-bridge'),samples});
  }
  await page.getByRole('navigation',{name:'Navegación principal',exact:true}).getByRole('link',{name:'Repuestos',exact:true}).click();
  await page.waitForTimeout(1500);
  if(!page.url().endsWith('#repuestos'))throw new Error('Repuestos menu left the landing');
  await page.screenshot({path:'output/playwright/recovery-desktop.png'});
  const catalog = await page.getByRole('link',{name:'Ver catálogo completo'}).getAttribute('href');
  if(catalog!=='/repuestos')throw new Error('Catalog is not accessible');
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.mouse.wheel(0,600);
  await page.waitForTimeout(200);
  const mobile = await page.evaluate(()=>({scroll:scrollY,state:document.querySelector('main').dataset.scrollMotion,width:document.documentElement.scrollWidth,viewport:innerWidth}));
  if(mobile.scroll<=0 || mobile.width>mobile.viewport)throw new Error('Mobile scroll or layout broken');
  await page.screenshot({path:'output/playwright/recovery-mobile.png'});
  if(failures.length || errors.length)throw new Error(JSON.stringify({failures,errors}));
  return {status:response.status(),state,failedAssets:failures,runtimeErrors:errors,boundaries:visibleMotion,menu:true,catalog,mobile};
}
