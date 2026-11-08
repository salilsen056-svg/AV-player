import {test,expect} from '@playwright/test';
test('library, playlists, stream validation and player controls',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.getByRole('heading',{name:'Your video library.'})).toBeVisible();
 await page.getByRole('button',{name:'Try the player'}).click();
 const video=page.locator('video');await expect(video).toBeVisible();
 await expect.poll(()=>video.evaluate(v=>v.readyState),{timeout:30000}).toBeGreaterThan(0);
 await page.getByRole('slider',{name:'Video brightness'}).fill('150');await expect(page.locator('[style*="brightness(150%)"]')).toBeVisible();
 await page.getByRole('slider',{name:'Volume',exact:true}).fill('35');await expect.poll(()=>video.evaluate(v=>v.volume)).toBeCloseTo(.35,1);
 await video.evaluate(v=>v.currentTime=15);await page.getByRole('button',{name:'Forward 10 seconds'}).click();await expect.poll(()=>video.evaluate(v=>v.currentTime)).toBeCloseTo(25,0);
 await page.getByRole('button',{name:'Rewind 10 seconds'}).click();await expect.poll(()=>video.evaluate(v=>v.currentTime)).toBeCloseTo(15,0);
 await page.getByRole('button',{name:'Close player'}).click();
 await page.getByRole('button',{name:'Playlists',exact:true}).click();await page.getByRole('button',{name:'New playlist'}).click();await page.getByPlaceholder('Sunday slowdowns').fill('Test collection');await page.getByRole('button',{name:'Create playlist'}).click();await expect(page.getByRole('heading',{name:'Test collection'})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'Playlists',exact:true}).click();await expect(page.getByRole('heading',{name:'Test collection'})).toBeVisible();
 await page.getByRole('button',{name:'Browse',exact:true}).click();await page.getByRole('button',{name:/Network stream/}).click();await page.getByPlaceholder('https://example.com/video.mp4').fill('javascript:alert(1)');await page.getByRole('button',{name:'Open stream',exact:true}).click();await expect(page.getByRole('status')).toContainText('valid HTTP');await page.getByRole('button',{name:'Close dialog'}).click();
 await page.getByRole('button',{name:'Video',exact:true}).click();await page.locator('input[type=file]').setInputFiles({name:'sample.mp4',mimeType:'video/mp4',buffer:Buffer.from('fixture')});await expect(page.getByRole('heading',{name:'sample.mp4'})).toBeVisible();await page.getByPlaceholder('Search your library').fill('missing');await expect(page.getByText('No matches found')).toBeVisible();expect(errors).toEqual([]);
});
test('mobile layout fits viewport',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/');await expect(page.getByRole('heading',{name:'Your video library.'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);await page.screenshot({path:'../mobile-preview.png',fullPage:true})});
