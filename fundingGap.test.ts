import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fundingGap, parseDollars } from './src/fundingGap';

test('dollar amounts parse the way people type them', () => {
  assert.equal(parseDollars('$1,200,000'), 1200000);
  assert.equal(parseDollars('1.2m'), 1200000);
  assert.equal(parseDollars('250K'), 250000);
  assert.equal(parseDollars(' 75000 '), 75000);
  assert.equal(parseDollars(''), 0);
  assert.equal(parseDollars('about a million'), 0);
});

test('only ticked sources count toward the gap', () => {
  const gap = fundingGap(2500000, [
    { name: 'Tax credits', amount: '$1,500,000', included: true },
    { name: 'HOME', amount: '400k', included: true },
    { name: 'Maybe later', amount: '$900,000', included: false },
  ]);
  assert.deepEqual(gap, { funded: 1900000, remaining: 600000 });
});

test('a surplus shows as a negative remaining gap', () => {
  assert.equal(fundingGap(100000, [{ name: 'Grant', amount: '150k', included: true }]).remaining, -50000);
});
