import '@pierre/diffs'
import type { FileDiffMetadata } from '@pierre/diffs'
import { FileDiff } from '@pierre/diffs/react'
import { useMemo } from 'react'

import './DiffViewer.css'

type DiffViewerProps = {
  selectedFile: FileDiffMetadata | null
  error: string | null
  hasChanges: boolean
  loading: boolean
  diffMode: 'unified' | 'split'
}

export function DiffViewer({ selectedFile, error, hasChanges, loading, diffMode }: DiffViewerProps) {
  const fileOptions = useMemo(
    () => ({
      theme: { dark: 'pierre-dark', light: 'pierre-light' } as const,
      themeType: 'system' as const,
      diffStyle: diffMode,
      diffIndicators: 'bars' as const,
      disableBackground: false,
      hunkSeparators: 'line-info' as const,
      expandUnchanged: false,
      expansionLineCount: 80,
      lineDiffType: 'word-alt' as const,
      maxLineDiffLength: 1000,
      disableLineNumbers: false,
      tokenizeMaxLineLength: 1000,
      disableFileHeader: true,
      overflow: 'wrap' as const,
    }),
    [diffMode]
  )

  return (
    <div className="diff-viewer">
      {error ? (
        <div className="diff-empty">Error: {error}</div>
      ) : !hasChanges ? (
        <div className="diff-empty">No changes detected yet.</div>
      ) : loading ? (
        <div className="diff-empty">Loading selected file diff…</div>
      ) : selectedFile == null ? (
        <div className="diff-empty">Select a file to view its diff.</div>
      ) : (
        <section className="diff-surface" aria-label="File diff">
          <div className="diff-scroll">
            <FileDiff fileDiff={selectedFile} options={fileOptions} />
          </div>
        </section>
      )}
    </div>
  )
}
