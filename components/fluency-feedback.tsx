import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface FluencyFeedbackProps {
  fluencyScore: number
  pronunciationScore: number
  vocabularyScore: number
  feedback: string
}

export function FluencyFeedback({ fluencyScore, pronunciationScore, vocabularyScore, feedback }: FluencyFeedbackProps) {
  return (
    <Card className="p-4 mt-4 bg-blue-50 border-blue-200">
      <h3 className="text-lg font-semibold text-blue-700 mb-2">Fluency Feedback</h3>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Fluency</span>
            <span className="text-sm font-medium">{fluencyScore}/10</span>
          </div>
          <Progress value={fluencyScore * 10} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Pronunciation</span>
            <span className="text-sm font-medium">{pronunciationScore}/10</span>
          </div>
          <Progress value={pronunciationScore * 10} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Vocabulary</span>
            <span className="text-sm font-medium">{vocabularyScore}/10</span>
          </div>
          <Progress value={vocabularyScore * 10} className="h-2" />
        </div>
      </div>

      <p className="mt-3 text-slate-700">{feedback}</p>
    </Card>
  )
}
