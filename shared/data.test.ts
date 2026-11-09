import {test} from 'node:test';import assert from 'node:assert/strict';import {countries,destinations,distance,offset,quizzes} from './data.ts';
test('Tokyo to Riyadh straight-line distance',()=>assert.ok(Math.abs(distance(countries[0],destinations[0])-8700)<300));
test('same point has zero distance',()=>assert.equal(distance(countries[0],countries[0]),0));
test('IANA offsets account for London daylight saving',()=>{assert.equal(offset('Europe/London',new Date('2026-07-01T12:00:00Z')),1);assert.equal(offset('Europe/London',new Date('2026-12-01T12:00:00Z')),0);assert.equal(offset('Asia/Riyadh'),3);assert.equal(offset('Asia/Kolkata'),5.5);});
test('all forty-one origin coordinates and zones are usable',()=>{assert.equal(countries.length,41);for(const c of countries){assert.ok(c.lat>=-90&&c.lat<=90);assert.ok(c.lon>=-180&&c.lon<=180);assert.ok(Number.isFinite(offset(c.zone)));}});
test('ten quizzes have a valid curated answer',()=>{assert.equal(quizzes.length,10);for(const q of quizzes)assert.ok(q.answers[q.correct]&&q.answersAr[q.correct]);});

