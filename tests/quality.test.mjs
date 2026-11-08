import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseMaster,qualityOptions,selectedMaster} from '../native/quality.mjs';
const base='https://example.com/video/master.m3u8?token=test';
const manifest=`#EXTM3U
#EXT-X-VERSION:7
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="a",NAME="English, stereo",URI="audio/en.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=500000,RESOLUTION=426x240,FRAME-RATE=29.970,AUDIO="a"
240/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=4000000,RESOLUTION=1920x1080,FRAME-RATE=60,VIDEO-RANGE=SDR,AUDIO="a"
1080/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=9000000,RESOLUTION=2560x1440,FRAME-RATE=59.940,VIDEO-RANGE=PQ,AUDIO="a"
1440/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=19000000,RESOLUTION=3840x2160,FRAME-RATE=60,VIDEO-RANGE=HLG,AUDIO="a"
2160/index.m3u8
`;
test('web and native use identical quality rules',()=>assert.equal(readFileSync(new URL('../web/src/quality.js',import.meta.url),'utf8'),readFileSync(new URL('../native/quality.mjs',import.meta.url),'utf8')));
test('requested qualities only available when resolution, frame rate and HDR match',()=>{const vs=parseMaster(manifest,base),opts=qualityOptions(vs);for(const id of ['240','1080','1440hdr','2160hdr'])assert.ok(opts.find(x=>x.id===id).variant);for(const id of ['360','480','720'])assert.equal(opts.find(x=>x.id===id).variant,undefined);assert.equal(vs[2].url,'https://example.com/video/1440/index.m3u8')});
test('SDR and low-frame-rate HDR cannot masquerade as 60 fps HDR',()=>{for(const patch of [s=>s.replaceAll('VIDEO-RANGE=PQ','VIDEO-RANGE=SDR'),s=>s.replace('FRAME-RATE=59.940','FRAME-RATE=30')])assert.equal(qualityOptions(parseMaster(patch(manifest),base)).find(x=>x.id==='1440hdr').variant,undefined)});
test('manual selection preserves alternate audio and uses absolute URLs',()=>{const vs=parseMaster(manifest,base),filtered=selectedMaster(manifest,base,vs[2]);assert.equal(parseMaster(filtered,base).length,1);assert.ok(filtered.includes('URI="https://example.com/video/audio/en.m3u8"'));assert.ok(filtered.includes('NAME="English, stereo"'));assert.ok(filtered.includes('AUDIO="a"'));assert.equal(parseMaster(filtered,base)[0].height,1440)});
test('single files, malformed manifests and dangerous variant URLs provide no pretend qualities',()=>{assert.deepEqual(parseMaster('plain text',base),[]);assert.deepEqual(parseMaster('#EXTM3U\n#EXTINF:2\na.ts',base),[]);assert.deepEqual(parseMaster('#EXTM3U\n#EXT-X-STREAM-INF:RESOLUTION=640x360\njavascript:alert(1)',base),[])});
