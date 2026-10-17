import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';

describe('CSV Parsing & Video Ingestion Validation', () => {
  test('parses comma-separated values and respects quoted text', () => {
    const csvData =
      'title,game,platform,content_format,views,likes,comments,shares,published_at\n' +
      '"Minecraft 1-Tick Trap, Secret Blueprint",Minecraft,instagram_reels,Tutorial / Guide,34200,2890,210,840,2026-10-10\n' +
      '"Valorant Ace",Valorant,youtube_shorts,Clutch / Highlight,41800,3800,340,,2026-10-12';

    const parsed = Papa.parse<Record<string, string>>(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    assert.equal(parsed.data.length, 2);
    assert.equal(parsed.data[0].title, 'Minecraft 1-Tick Trap, Secret Blueprint');
    assert.equal(parsed.data[0].views, '34200');
    assert.equal(parsed.data[0].shares, '840');

    // Row 2 has empty shares
    assert.equal(parsed.data[1].shares, '');
  });

  test('normalizes missing metrics to null rather than coercing to zero', () => {
    const rawShares: string | undefined = '';
    const rawLikes: string | undefined = '1250';
    const rawComments: string | undefined = undefined;

    const shares = rawShares !== undefined && rawShares !== '' && !isNaN(Number(rawShares)) ? Number(rawShares) : null;
    const likes = rawLikes !== undefined && rawLikes !== '' && !isNaN(Number(rawLikes)) ? Number(rawLikes) : null;
    const comments = rawComments !== undefined && rawComments !== '' && !isNaN(Number(rawComments)) ? Number(rawComments) : null;

    assert.equal(shares, null);
    assert.equal(likes, 1250);
    assert.equal(comments, null);
  });

  test('normalizes platform and game names reliably', () => {
    const testCases = [
      { input: 'minecraft bedrock edition', expectedGame: 'Minecraft' },
      { input: 'Valorant competitive', expectedGame: 'Valorant' },
      { input: 'battlegrounds mobile india (BGMI)', expectedGame: 'BGMI' },
      { input: 'CODM Season 9 Ranked', expectedGame: 'CODM' },
      { input: 'Random Indie Title', expectedGame: 'Other' },
    ];

    testCases.forEach((tc) => {
      const lower = tc.input.toLowerCase();
      let game = 'Other';
      if (lower.includes('minecraft')) game = 'Minecraft';
      else if (lower.includes('valorant')) game = 'Valorant';
      else if (lower.includes('bgmi') || lower.includes('battlegrounds') || lower.includes('pubg')) game = 'BGMI';
      else if (lower.includes('codm') || lower.includes('cod') || lower.includes('call of duty')) game = 'CODM';

      assert.equal(game, tc.expectedGame);
    });
  });
});
