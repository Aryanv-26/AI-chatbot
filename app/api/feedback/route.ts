import { NextResponse } from "next/server"

// Generate feedback based on the user's messages
function generateFeedback(messages: string[], duration: number) {
  // Calculate scores based on message characteristics
  const calculateScores = () => {
    // This is a simplified scoring algorithm for demo purposes
    const totalWords = messages.join(" ").split(" ").length
    const avgWordsPerMessage = totalWords / messages.length
    const uniqueWords = new Set(messages.join(" ").toLowerCase().split(/\W+/)).size
    const vocabularyRichness = uniqueWords / totalWords

    // Base scores
    let fluencyScore = 7
    let grammarScore = 7
    let vocabularyScore = 6
    let pronunciationScore = 7

    // Adjust based on message characteristics
    if (avgWordsPerMessage > 10) fluencyScore += 1
    if (avgWordsPerMessage > 15) fluencyScore += 1
    if (vocabularyRichness > 0.6) vocabularyScore += 2
    if (vocabularyRichness > 0.5) vocabularyScore += 1
    if (messages.length > 5) fluencyScore += 1

    // Randomize slightly for demo purposes
    fluencyScore = Math.min(10, Math.max(1, fluencyScore + (Math.random() * 2 - 1)))
    grammarScore = Math.min(10, Math.max(1, grammarScore + (Math.random() * 2 - 1)))
    vocabularyScore = Math.min(10, Math.max(1, vocabularyScore + (Math.random() * 2 - 1)))
    pronunciationScore = Math.min(10, Math.max(1, pronunciationScore + (Math.random() * 2 - 1)))

    // Round to nearest 0.5
    return {
      fluencyScore: Math.round(fluencyScore * 2) / 2,
      grammarScore: Math.round(grammarScore * 2) / 2,
      vocabularyScore: Math.round(vocabularyScore * 2) / 2,
      pronunciationScore: Math.round(pronunciationScore * 2) / 2,
    }
  }

  const scores = calculateScores()

  // Generate strengths based on highest scores
  const generateStrengths = () => {
    const strengths = []
    const highScores = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)

    for (const [category, score] of highScores) {
      if (score >= 7) {
        if (category === "fluencyScore") {
          strengths.push("You speak with good flow and natural pacing")
        } else if (category === "grammarScore") {
          strengths.push("Your grammar usage is generally accurate")
        } else if (category === "vocabularyScore") {
          strengths.push("You use a good range of vocabulary")
        } else if (category === "pronunciationScore") {
          strengths.push("Your pronunciation is clear and understandable")
        }
      }
    }

    // Add general strengths if we don't have enough
    if (strengths.length < 2) {
      strengths.push("You're willing to practice speaking, which is essential for improvement")
      strengths.push("You can express your ideas in English")
    }

    return strengths
  }

  // Generate areas to improve based on lowest scores
  const generateAreasToImprove = () => {
    const areas = []
    const lowScores = Object.entries(scores)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 2)

    for (const [category, score] of lowScores) {
      if (score <= 8) {
        if (category === "fluencyScore") {
          areas.push("Try to speak more smoothly with fewer pauses")
        } else if (category === "grammarScore") {
          areas.push("Focus on verb tenses and sentence structure")
        } else if (category === "vocabularyScore") {
          areas.push("Try to incorporate more varied vocabulary")
        } else if (category === "pronunciationScore") {
          areas.push("Practice the pronunciation of specific sounds like 'th' and 'r'")
        }
      }
    }

    // Add general areas if we don't have enough
    if (areas.length < 2) {
      areas.push("Try to speak for longer periods without stopping")
      areas.push("Practice using more complex sentence structures")
    }

    return areas
  }

  const strengths = generateStrengths()
  const areasToImprove = generateAreasToImprove()

  // Generate overall feedback
  const generateOverallFeedback = () => {
    const avgScore =
      (scores.fluencyScore + scores.grammarScore + scores.vocabularyScore + scores.pronunciationScore) / 4

    if (avgScore >= 8) {
      return "You're communicating very effectively in English! Your speaking skills are strong, and you're able to express yourself clearly. Continue practicing with more complex topics and challenging vocabulary to reach an even higher level of proficiency."
    } else if (avgScore >= 6) {
      return "You're doing well with your English speaking practice. You can communicate your ideas effectively, though there are some areas where you can improve. Regular practice will help you become more confident and fluent over time."
    } else {
      return "You're making good progress with your English speaking. Continue practicing regularly, and focus on the areas for improvement mentioned above. Don't be afraid to make mistakes - they're an important part of the learning process!"
    }
  }

  return {
    ...scores,
    strengths,
    areasToImprove,
    overallFeedback: generateOverallFeedback(),
  }
}

export async function POST(req: Request) {
  try {
    const { messages, duration } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 })
    }

    // Use our fallback function instead of OpenAI
    const feedback = generateFeedback(messages, duration)

    return NextResponse.json(feedback)
  } catch (error) {
    console.error("Error generating feedback:", error)
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 })
  }
}
