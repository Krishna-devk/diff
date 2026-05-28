import { Router } from 'express'
import { getRepoPath } from '../services/diffs/watcher'
import { readQuizResults } from '../services/quizResults'

export const statsRouter = Router()

statsRouter.get('/stats/leaderboard', async (req, res) => {
  const repoPath = getRepoPath()
  let personalScore = 0
  let personalQuizzesPassed = 0

  if (repoPath) {
    try {
      const results = await readQuizResults(repoPath)
      if (Array.isArray(results)) {
        personalQuizzesPassed = results.length
        personalScore = results.reduce((sum, item) => sum + (item.score || 0) * 10, 0)
      }
    } catch {
      // Ignore
    }
  }

  // Beautiful mock team leaderboard data, injecting the active developer dynamically
  const leaderboard = [
    { rank: 1, name: 'Alex Johnson', score: 980, passed: 12, streak: 5 },
    { rank: 2, name: 'You (Active Developer)', score: Math.max(80, personalScore), passed: Math.max(1, personalQuizzesPassed), streak: Math.max(1, personalQuizzesPassed) },
    { rank: 3, name: 'Sarah Patel', score: 450, passed: 6, streak: 3 },
    { rank: 4, name: 'Michael Chen', score: 320, passed: 4, streak: 2 },
    { rank: 5, name: 'Elena Rostova', score: 180, passed: 2, streak: 1 },
  ].sort((a, b) => b.score - a.score)

  // Re-rank
  const ranked = leaderboard.map((item, index) => ({ ...item, rank: index + 1 }))

  res.json({
    leaderboard: ranked,
    stats: {
      teamAccuracy: '88%',
      totalQuizzesTaken: ranked.reduce((sum, item) => sum + item.passed, 0),
      cognitiveGateBlocks: 14, // Simulated gatekeeper blocks
    }
  })
})
