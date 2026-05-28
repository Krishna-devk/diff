import { useEffect, useState } from 'react'
import './Dashboard.css'

export type LeaderboardItem = {
  rank: number
  name: string
  score: number
  passed: number
  streak: number
}

export type StatsPayload = {
  leaderboard: LeaderboardItem[]
  stats: {
    teamAccuracy: string
    totalQuizzesTaken: number
    cognitiveGateBlocks: number
  }
}

type DashboardProps = {
  triggerReloadKey?: number
}

export function Dashboard({ triggerReloadKey }: DashboardProps) {
  const [data, setData] = useState<StatsPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    fetch('http://localhost:3001/stats/leaderboard')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load leaderboard stats (${res.status})`)
        return res.json() as Promise<StatsPayload>
      })
      .then((payload) => {
        if (!active) return
        setData(payload)
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [triggerReloadKey])

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner" />
        <h3>Loading Cognitive Analytics...</h3>
        <p>Syncing developer stats, computing accuracies, and aggregating leaderboards...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="dashboard-error-icon">⚠️</div>
        <h3>Failed to Load Analytics</h3>
        <p>{error}</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="dashboard-panel">
      {/* Premium Metric Grid Row */}
      <div className="dashboard-grid">
        <div className="metric-card card-glow-green">
          <div className="metric-header">
            <span className="metric-icon">🎯</span>
            <span className="metric-label">TEAM ACCURACY</span>
          </div>
          <div className="metric-value">{data.stats.teamAccuracy}</div>
          <div className="metric-footer">Target: &gt;85% first-attempt</div>
        </div>

        <div className="metric-card card-glow-blue">
          <div className="metric-header">
            <span className="metric-icon">🔥</span>
            <span className="metric-label">TOTAL QUIZZES CLEARED</span>
          </div>
          <div className="metric-value">{data.stats.totalQuizzesTaken}</div>
          <div className="metric-footer">Active verify cycle checks</div>
        </div>

        <div className="metric-card card-glow-red">
          <div className="metric-header">
            <span className="metric-icon">🛡️</span>
            <span className="metric-label">COGNITIVE GATE SAVES</span>
          </div>
          <div className="metric-value">{data.stats.cognitiveGateBlocks}</div>
          <div className="metric-footer">Unverified merges intercepted</div>
        </div>
      </div>

      {/* Leaderboard Table Section */}
      <div className="leaderboard-section">
        <div className="leaderboard-header">
          <h3>🏆 TEAM COMPREHENSION LEADERBOARD</h3>
          <p>Developers ranked by verified active-recall comprehension scores.</p>
        </div>

        <div className="leaderboard-table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="align-center">RANK</th>
                <th>DEVELOPER</th>
                <th className="align-center">SCORE</th>
                <th className="align-center">QUIZZES PASSED</th>
                <th className="align-center">STREAK</th>
              </tr>
            </thead>
            <tbody>
              {data.leaderboard.map((item) => (
                <tr 
                  key={item.name} 
                  className={`leaderboard-row ${item.name.includes('You') ? 'is-active-user' : ''}`}
                >
                  <td className="align-center">
                    <span className={`rank-badge rank-${item.rank}`}>
                      {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}
                    </span>
                  </td>
                  <td>
                    <div className="dev-profile">
                      <span className="dev-avatar">{item.name.charAt(0)}</span>
                      <span className="dev-name">{item.name}</span>
                    </div>
                  </td>
                  <td className="align-center dev-score"><strong>{item.score} pts</strong></td>
                  <td className="align-center">{item.passed}</td>
                  <td className="align-center font-orange">🔥 {item.streak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
