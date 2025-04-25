import { NextResponse } from "next/server"

// Mock grammar analysis function for preview/demo mode
function analyzeGrammar(text: string) {
  // Simple grammar checks for demonstration purposes
  const corrections = []

  // Check for missing articles
  if (/\b(go to|went to) (store|school|park|mall)\b/i.test(text)) {
    const match = text.match(/\b(go to|went to) (store|school|park|mall)\b/i)
    if (match) {
      corrections.push({
        original: match[0],
        corrected: match[1] + " the " + match[2],
        explanation: "Use 'the' before specific places like store, school, park, etc.",
      })
    }
  }

  // Check for subject-verb agreement
  if (/\b(he|she|it) (are|were|have)\b/i.test(text)) {
    const match = text.match(/\b(he|she|it) (are|were|have)\b/i)
    if (match) {
      const correction = match[2] === "are" ? "is" : match[2] === "were" ? "was" : "has"
      corrections.push({
        original: match[0],
        corrected: match[1] + " " + correction,
        explanation: `Use '${correction}' with singular subjects like ${match[1]}.`,
      })
    }
  }

  // Check for incorrect verb tense
  if (/\byesterday I (go|eat|see|come)\b/i.test(text)) {
    const match = text.match(/\byesterday I (go|eat|see|come)\b/i)
    if (match) {
      const pastTense = {
        go: "went",
        eat: "ate",
        see: "saw",
        come: "came",
      }[match[1].toLowerCase()]

      corrections.push({
        original: match[0],
        corrected: `yesterday I ${pastTense}`,
        explanation: "Use past tense for actions that happened in the past.",
      })
    }
  }

  // Add a random correction if none were found (for demo purposes)
  if (corrections.length === 0 && text.length > 15 && Math.random() > 0.5) {
    const words = text.split(" ")
    if (words.length > 3) {
      const randomIndex = Math.floor(Math.random() * (words.length - 3)) + 1
      const randomWord = words[randomIndex]

      // Only suggest corrections for common words
      if (randomWord.length > 3 && !["the", "and", "that", "with"].includes(randomWord.toLowerCase())) {
        corrections.push({
          original: randomWord,
          corrected: randomWord + "s", // Simple example correction
          explanation: "Consider using the plural form here for better clarity.",
        })
      }
    }
  }

  return corrections
}

// Generate a contextual response based on the user's message
function generateResponse(message: string, previousMessages: any[]) {
  // Simple response templates
  const responses = [
    "That's interesting! Could you tell me more about that?",
    "I understand what you're saying. What do you think about this topic?",
    "That's a great point. Have you considered looking at it from another perspective?",
    "I see what you mean. In English, we often express this idea differently.",
    "That's a good way to phrase it. You're making great progress!",
    "I like how you expressed that. Let's explore this topic further.",
    "That's a complex idea you've explained well. Would you like to practice more advanced vocabulary?",
    "You're doing great! Let's try to use some different expressions for variety.",
  ]

  // Topic-specific responses
  if (message.toLowerCase().includes("hobby") || message.toLowerCase().includes("free time")) {
    return "Hobbies are a great way to practice English! What do you enjoy doing in your free time?"
  }

  if (message.toLowerCase().includes("travel") || message.toLowerCase().includes("vacation")) {
    return "Traveling is a wonderful experience! Have you visited any interesting places recently? Or is there somewhere you'd like to go?"
  }

  if (message.toLowerCase().includes("food") || message.toLowerCase().includes("cook")) {
    return "Food is always a fun topic to discuss! What kind of cuisine do you enjoy? Do you like to cook?"
  }

  if (
    message.toLowerCase().includes("movie") ||
    message.toLowerCase().includes("film") ||
    message.toLowerCase().includes("watch")
  ) {
    return "Movies are a great way to improve your English listening skills! What kind of films do you enjoy watching?"
  }

  // Check if it's a question
  if (message.endsWith("?")) {
    return "That's a good question! " + responses[Math.floor(Math.random() * 3)]
  }

  // Default random response
  return responses[Math.floor(Math.random() * responses.length)]
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // The last message from the user
    const userMessage = messages.filter((m: any) => m.role === "user").pop()

    if (!userMessage) {
      return NextResponse.json({ error: "No user message provided" }, { status: 400 })
    }

    // Get previous messages for context
    const previousMessages = messages.slice(0, -1)

    // Use our fallback functions instead of OpenAI
    const corrections = analyzeGrammar(userMessage.content)
    const responseContent = generateResponse(userMessage.content, previousMessages)

    return NextResponse.json({
      role: "assistant",
      content: responseContent,
      corrections: corrections,
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Failed to process your request" }, { status: 500 })
  }
}
