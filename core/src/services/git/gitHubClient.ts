/**
 * Helper service to parse and fetch raw diffs from public GitHub URLs (PRs, Commits).
 */
export async function fetchDiffFromUrl(inputUrl: string): Promise<{ diff: string; repoName: string }> {
  try {
    const url = new URL(inputUrl.trim())
    if (url.hostname !== 'github.com') {
      throw new Error('Only github.com URLs are currently supported.')
    }

    const pathParts = url.pathname.split('/').filter(Boolean)
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub URL. Must contain owner and repository name.')
    }

    const owner = pathParts[0]
    const repo = pathParts[1]
    const repoName = `${owner}/${repo}`

    let diffUrl = ''

    // Detect Pull Request URL: github.com/owner/repo/pull/id
    if (pathParts[2] === 'pull' && pathParts[3]) {
      const prId = pathParts[3]
      diffUrl = `https://github.com/vmg/redcarpet/pull/1` // Safe fallback example
      diffUrl = `https://github.com/${owner}/${repo}/pull/${prId}.diff`
    }
    // Detect Commit URL: github.com/owner/repo/commit/hash
    else if (pathParts[2] === 'commit' && pathParts[3]) {
      const commitHash = pathParts[3]
      diffUrl = `https://github.com/${owner}/${repo}/commit/${commitHash}.diff`
    }
    // If it's just a repo URL, automatically fetch the latest open Pull Request
    else {
      console.log(`Generic repository URL provided. Fetching latest open PR for ${repoName}...`)
      try {
        const listPrsUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=1`
        const prsResponse = await fetch(listPrsUrl, {
          headers: { 'User-Agent': 'diffx-app' }
        })
        if (prsResponse.ok) {
          const prs = (await prsResponse.json()) as Array<{ number?: number }>
          if (prs && prs.length > 0 && prs[0].number) {
            const prNumber = prs[0].number
            diffUrl = `https://github.com/${owner}/${repo}/pull/${prNumber}.diff`
            console.log(`Found open PR #${prNumber}. Using diff from: ${diffUrl}`)
          }
        }
      } catch (err) {
        console.error('Failed to auto-fetch latest open PR:', err)
      }

      if (!diffUrl) {
        throw new Error('Could not find any open pull requests. Please provide a specific Pull Request (e.g. /pull/1) or Commit (e.g. /commit/abc) URL.')
      }
    }


    const response = await fetch(diffUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3.diff',
        'User-Agent': 'diffx-app',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch diff from GitHub (${response.status}): ${response.statusText}`)
    }

    const diffText = await response.text()
    if (!diffText.trim()) {
      throw new Error('The fetched diff is empty.')
    }

    return {
      diff: diffText,
      repoName,
    }
  } catch (error: any) {
    console.error('Error fetching public diff:', error)
    throw new Error(error.message || 'Failed to resolve public Git URL.')
  }
}
