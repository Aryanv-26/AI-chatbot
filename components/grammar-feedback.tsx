type Correction = {
  original: string
  corrected: string
  explanation: string
}

interface GrammarFeedbackProps {
  corrections: Correction[]
}

export function GrammarFeedback({ corrections }: GrammarFeedbackProps) {
  if (!corrections || corrections.length === 0) {
    return null
  }

  return (
    <div className="mt-3 pt-3 border-t border-orange-200">
      <h4 className="text-sm font-semibold text-orange-700 mb-2">Grammar Feedback</h4>
      <div className="space-y-2">
        {corrections.map((correction, index) => (
          <div key={index} className="bg-orange-50 p-2 rounded text-sm">
            <div className="flex flex-wrap gap-2 items-center mb-1">
              <span className="line-through text-red-500">{correction.original}</span>
              <span className="text-slate-500">→</span>
              <span className="text-green-600 font-medium">{correction.corrected}</span>
            </div>
            <p className="text-xs text-slate-700">{correction.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
