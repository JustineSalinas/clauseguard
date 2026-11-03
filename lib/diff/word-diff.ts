export interface DiffToken {
  type: "common" | "added" | "removed";
  value: string;
}

/**
 * Clean word-level LCS diff algorithm for contract redline comparisons.
 */
export function computeWordDiff(original: string, revised: string): DiffToken[] {
  const origWords = original.split(/\s+/).filter(Boolean);
  const revWords = revised.split(/\s+/).filter(Boolean);

  const n = origWords.length;
  const m = revWords.length;

  // DP table for LCS length
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (origWords[i - 1].toLowerCase() === revWords[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find diff tokens
  const tokens: DiffToken[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (
      i > 0 &&
      j > 0 &&
      origWords[i - 1].toLowerCase() === revWords[j - 1].toLowerCase()
    ) {
      tokens.unshift({ type: "common", value: revWords[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tokens.unshift({ type: "added", value: revWords[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      tokens.unshift({ type: "removed", value: origWords[i - 1] });
      i--;
      j--;
    }
  }

  return tokens;
}

