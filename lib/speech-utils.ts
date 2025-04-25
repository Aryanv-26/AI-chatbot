// Helper functions for speech recognition and synthesis

declare var SpeechRecognition: any // Declare SpeechRecognition

export function setupSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === "undefined") return null

  if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    return recognition
  }

  return null
}

export function speakText(text: string, onEnd?: () => void): void {
  if (typeof window === "undefined") return

  if ("speechSynthesis" in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-US"
    utterance.rate = 0.9 // Slightly slower for learners

    if (onEnd) {
      utterance.onend = onEnd
    }

    window.speechSynthesis.speak(utterance)
  }
}

export function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined") return []

  if ("speechSynthesis" in window) {
    return window.speechSynthesis.getVoices()
  }

  return []
}

// TypeScript declarations
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}
