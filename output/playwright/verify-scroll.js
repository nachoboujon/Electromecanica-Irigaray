async (page) => {
  const results = { desktop: {}, mobile: {} };
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  const frames = async (target) => target.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const scroll = async (target, y) => { await target.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y); await frames(target); };
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const settle = async target => {
    let last = -1, stable = 0;
    for (let attempt = 0; attempt < 50; attempt++) {
      await target.waitForTimeout(80);
      const y = await target.evaluate(() => scrollY);
      stable = Math.abs(y - last) < .1 ? stable + 1 : 0;
      last = y;
      if (stable >= 3) return;
    }
    throw new Error('Native scrolling did not settle');
  };
  async function inspect(target, label) {
    await target.waitForSelector('[data-scroll-motion="ready"]');
    const bridges = await target.locator('[data-motion-bridge]').evaluateAll(elements => elements.map(element => ({ kind: element.dataset.motionBridge, top: element.getBoundingClientRect().top + window.scrollY, height: element.offsetHeight })));
    const viewport = target.viewportSize().height;
    const maxScroll = await target.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const sequence = [];
    for (let index = 0; index < bridges.length; index++) {
      const bridge = bridges[index];
      const end = Math.min(bridge.top + bridge.height * .4 - viewport * .2, maxScroll);
      const start = Math.min(bridge.top - viewport * .92, end - 1);
      const positions = [.15, .5, .85].map(p => Math.round(start + (end - start) * p));
      const samples = [];
      for (const y of positions) {
        await scroll(target, y);
        samples.push(await target.locator('[data-motion-bridge]').nth(index).evaluate(element => ({ progress: Number(element.style.getPropertyValue('--bridge')), transform: getComputedStyle(element.querySelector('.bridge-surface--to')).transform, opacity: getComputedStyle(element.querySelector('.bridge-surface--to')).opacity, ribbon: getComputedStyle(element.querySelector('.bridge-ribbon')).transform })));
      }
      assert(samples[0].progress < samples[1].progress && samples[1].progress < samples[2].progress, `${label} ${bridge.kind}: progress does not follow scroll`);
      assert(JSON.stringify(samples[0]) !== JSON.stringify(samples[2]), `${label} ${bridge.kind}: no visual change`);
      await scroll(target, positions[1]);
      const midpoint = await target.locator('[data-motion-bridge]').nth(index).evaluate(element => element.style.getPropertyValue('--bridge'));
      const composition = await target.locator('[data-motion-item]').evaluateAll(elements => elements.map(element => element.style.cssText).join('|'));
      await target.waitForTimeout(240);
      assert(midpoint === await target.locator('[data-motion-bridge]').nth(index).evaluate(element => element.style.getPropertyValue('--bridge')), `${label} ${bridge.kind}: keeps moving while stopped`);
      assert(composition === await target.locator('[data-motion-item]').evaluateAll(elements => elements.map(element => element.style.cssText).join('|')), `${label} ${bridge.kind}: composition keeps moving while stopped`);
      await target.screenshot({ path: `output/playwright/${label}-${bridge.kind}.png` });
      for (let p = positions.length - 1; p >= 0; p--) {
        await scroll(target, positions[p]);
        const value = await target.locator('[data-motion-bridge]').nth(index).evaluate(element => Number(element.style.getPropertyValue('--bridge')));
        assert(Math.abs(value - samples[p].progress) < .001, `${label} ${bridge.kind}: reverse is not deterministic`);
      }
      sequence.push({ kind: bridge.kind, down: samples.map(sample => sample.progress), reverse: true, paused: true });
    }
    const overflow = await target.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert(!overflow, `${label}: horizontal overflow`);
    return sequence;
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:3000');
  await page.evaluate(() => document.fonts.ready);
  results.desktop.boundaries = await inspect(page, 'desktop');
  const order = await page.locator('[data-motion-section]').evaluateAll(elements => elements.map(element => element.dataset.motionSection));
  const expectedOrder = order.includes('experiencias') ? 'inicio,servicios,repuestos,taller,experiencias,preguntas,contacto,pie' : 'inicio,servicios,repuestos,taller,preguntas,contacto,pie';
  assert(order.join(',') === expectedOrder, 'Unexpected section order');
  results.desktop.order = order;
  // A long menu jump must pass through every intermediate bridge.
  await scroll(page, 0);
  await page.evaluate(() => {
    window.__bridgeSamples = [];
    window.__observeBridges = () => requestAnimationFrame(() => window.__bridgeSamples.push([...document.querySelectorAll('[data-motion-bridge]')].map(element => Number(element.style.getPropertyValue('--bridge')))));
    window.addEventListener('scroll', window.__observeBridges, { passive: true });
  });
  await page.getByRole('link', { name: 'Hablemos', exact: true }).click();
  await settle(page);
  const traversed = await page.evaluate(() => {
    window.removeEventListener('scroll', window.__observeBridges);
    const intermediateCount = document.querySelectorAll('[data-motion-bridge]').length - 1;
    return Array.from({length: intermediateCount}, (_, index) => window.__bridgeSamples.some(sample => sample[index] > .02 && sample[index] < .98));
  });
  assert(traversed.every(Boolean), 'Menu jump skipped intermediate transitions');
  results.desktop.menuIntermediateTransitions = traversed;
  for (const [name, id] of [['Servicios','servicios'],['Preguntas','preguntas'],['Repuestos','repuestos'],['El taller','taller']]) {
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name, exact: true }).click();
    await settle(page);
    const top = await page.locator(`#${id}`).evaluate(element => element.getBoundingClientRect().top);
    assert(top >= 0 && top < 150, `Menu destination ${id} is obscured or misplaced: ${top}`);
  }
  results.desktop.menuDestinations = true;
  const contourTop = await page.locator('[data-motion-bridge="contour"]').evaluate(element => element.getBoundingClientRect().top + window.scrollY);
  await scroll(page, contourTop - 550);
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 150);
  await page.waitForTimeout(180);
  const down = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, -150);
  await page.waitForTimeout(180);
  const up = await page.evaluate(() => scrollY);
  assert(down > before && up < down, 'Native wheel cannot reverse scroll');
  results.desktop.wheel = { before, down, up };
  await scroll(page, 0);
  const barWidth = await page.evaluate(() => innerWidth - document.documentElement.clientWidth);
  if (barWidth > 0) {
    await page.mouse.move(1440 - barWidth / 2, 30);
    await page.mouse.down();
    await page.mouse.move(1440 - barWidth / 2, 350, { steps: 10 });
    await page.mouse.up();
    const dragged = await page.evaluate(() => scrollY);
    assert(dragged > 0, 'Scrollbar thumb drag did not scroll');
    results.desktop.scrollbarDrag = dragged;
  } else results.desktop.scrollbarDrag = 'Headless browser uses an overlay scrollbar; absolute scroll positions covered above';
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await frames(page);
  const reduced = await page.locator('[data-motion-item]').evaluateAll(elements => elements.every(element => getComputedStyle(element).transform === 'none' && getComputedStyle(element).opacity === '1'));
  assert(reduced, 'Reduced motion does not expose stable readable content');
  results.desktop.reducedMotion = reduced;
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await frames(page);
  const context = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const mobile = await context.newPage();
  mobile.on('pageerror', error => runtimeErrors.push(error.message));
  await mobile.goto('http://127.0.0.1:3000');
  results.mobile.boundaries = await inspect(mobile, 'mobile');
  await scroll(mobile, 0);
  const cdp = await context.newCDPSession(mobile);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 720 }] });
  for (let y = 670; y >= 270; y -= 50) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await mobile.waitForTimeout(250);
  const touchDown = await mobile.evaluate(() => scrollY);
  assert(touchDown > 0, 'Mobile touch gesture does not scroll');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 270 }] });
  for (let y = 320; y <= 720; y += 50) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await mobile.waitForTimeout(250);
  const touchUp = await mobile.evaluate(() => scrollY);
  assert(touchUp < touchDown, 'Mobile touch cannot reverse scroll');
  results.mobile.touch = { down: touchDown, up: touchUp };
  await mobile.getByRole('navigation', { name: 'Secciones del sitio' }).getByRole('link', { name: 'Contacto', exact: true }).click();
  await settle(mobile);
  const contactTop = await mobile.locator('#contacto').evaluate(element => element.getBoundingClientRect().top);
  assert(contactTop >= 0 && contactTop < 160, `Mobile menu contact is obscured: ${contactTop}`);
  results.mobile.menu = true;
  assert(runtimeErrors.length === 0, `Runtime errors: ${runtimeErrors.join('; ')}`);
  results.runtimeErrors = runtimeErrors;
  await context.close();
  return results;
}
