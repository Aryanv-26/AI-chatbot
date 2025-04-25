"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, ArrowLeft, Volume2, VolumeX, RotateCcw, Shuffle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { GrammarFeedback } from "@/components/grammar-feedback"
import { Avatar } from "@/components/ui/avatar"
import { AvatarImage } from "@/components/ui/avatar"
import { AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Message = {
  role: "user" | "assistant"
  content: string
  corrections?: {
    original: string
    corrected: string
    explanation: string
  }[]
}

type FeedbackSummary = {
  fluencyScore: number
  grammarScore: number
  vocabularyScore: number
  pronunciationScore: number
  strengths: string[]
  areasToImprove: string[]
  overallFeedback: string
}

type ConversationTopic = {
  title: string
  description: string
  category: string
  initialPrompt: string
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

// Conversation topics organized by category
const CONVERSATION_TOPICS: ConversationTopic[] = [
  {
    title: "Daily Routine",
    description: "Talk about your typical day and daily activities",
    category: "Everyday Life",
    initialPrompt:
      "Let's talk about daily routines. Could you tell me about your typical day? What time do you usually wake up and what activities do you do throughout the day?",
  },
  {
    title: "Hobbies & Interests",
    description: "Discuss activities you enjoy in your free time",
    category: "Everyday Life",
    initialPrompt:
      "I'd love to hear about your hobbies and interests. What do you enjoy doing in your free time? Do you have any particular activities you're passionate about?",
  },
  {
    title: "Food & Cooking",
    description: "Talk about favorite foods and cooking experiences",
    category: "Everyday Life",
    initialPrompt:
      "Let's discuss food and cooking. What kinds of food do you enjoy eating? Do you like to cook? Perhaps you could tell me about a favorite dish or restaurant.",
  },
  {
    title: "Travel Experiences",
    description: "Share stories about places you've visited",
    category: "Travel",
    initialPrompt:
      "I'd love to hear about your travel experiences. Have you visited any interesting places? What was your favorite trip and why did you enjoy it?",
  },
  {
    title: "Dream Vacation",
    description: "Describe your ideal holiday destination",
    category: "Travel",
    initialPrompt:
      "Let's talk about dream vacations. If you could go anywhere in the world, where would you choose to visit and why? What activities would you like to do there?",
  },
  {
    title: "Cultural Differences",
    description: "Discuss cultural variations between countries",
    category: "Travel",
    initialPrompt:
      "I'm interested in hearing your thoughts on cultural differences. Have you noticed any interesting cultural differences between countries or regions you've experienced?",
  },
  {
    title: "Movies & TV Shows",
    description: "Talk about films and series you enjoy watching",
    category: "Entertainment",
    initialPrompt:
      "Let's discuss movies and TV shows. What kinds of films or series do you enjoy watching? Do you have any favorites you'd recommend, and what do you like about them?",
  },
  {
    title: "Music Preferences",
    description: "Share your favorite music genres and artists",
    category: "Entertainment",
    initialPrompt:
      "I'd love to hear about your music preferences. What kinds of music do you enjoy listening to? Do you have favorite artists or songs that you particularly like?",
  },
  {
    title: "Books & Reading",
    description: "Discuss literature and reading habits",
    category: "Entertainment",
    initialPrompt:
      "Let's talk about books and reading. Do you enjoy reading? What kinds of books do you prefer? Perhaps you could tell me about a book that made an impact on you.",
  },
  {
    title: "Career Goals",
    description: "Talk about your professional aspirations",
    category: "Work & Education",
    initialPrompt:
      "I'm interested in hearing about your career goals. What kind of work do you do or hope to do in the future? What aspects of your career are most important to you?",
  },
  {
    title: "Learning Experiences",
    description: "Share stories about educational journeys",
    category: "Work & Education",
    initialPrompt:
      "Let's discuss learning experiences. What have been some valuable things you've learned, either in school or outside of formal education? How do you prefer to learn new skills?",
  },
  {
    title: "Technology Impact",
    description: "Discuss how technology affects daily life",
    category: "Technology",
    initialPrompt:
      "I'd like to hear your thoughts on how technology impacts daily life. How has technology changed the way you live, work, or communicate? Do you think these changes are mostly positive or negative?",
  },
  {
    title: "Social Media",
    description: "Talk about social platforms and online presence",
    category: "Technology",
    initialPrompt:
      "Let's talk about social media. Do you use social media platforms? How do you think they affect society and personal relationships? What are the benefits and drawbacks?",
  },
  {
    title: "Environmental Issues",
    description: "Discuss climate change and sustainability",
    category: "Current Issues",
    initialPrompt:
      "I'm interested in your thoughts on environmental issues. Are you concerned about climate change? What do you think individuals can do to live more sustainably?",
  },
  {
    title: "Health & Wellness",
    description: "Talk about staying healthy and self-care",
    category: "Health",
    initialPrompt:
      "Let's discuss health and wellness. What do you do to stay healthy? Do you have any particular routines or practices for physical or mental well-being?",
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showFeedbackSummary, setShowFeedbackSummary] = useState(false)
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary | null>(null)
  const [sessionDuration, setSessionDuration] = useState(0)
  const [sessionActive, setSessionActive] = useState(false)
  const [input, setInput] = useState("")
  const [showTopicSelector, setShowTopicSelector] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic | null>(null)
  const [currentSpeaker, setCurrentSpeaker] = useState<"assistant" | "user" | null>(null)
  const [avatarSpeaking, setAvatarSpeaking] = useState(false)
  const [conversationStarted, setConversationStarted] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const { toast } = useToast()

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: any) => {
          const interimTranscript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join("")

          setTranscript(interimTranscript)
        }

        recognitionRef.current.onend = () => {
          if (isRecording) {
            // If we're still supposed to be recording, restart it
            // This handles the case where the browser stops listening automatically
            recognitionRef.current.start()
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          if (event.error === "not-allowed") {
            setIsRecording(false)
            toast({
              title: "Microphone Access Denied",
              description: "Please allow microphone access to use voice conversation.",
              variant: "destructive",
            })
          }
        }
      } else {
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser doesn't support speech recognition. Please try a different browser like Chrome.",
          variant: "destructive",
        })
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [toast])

  // Session timer
  useEffect(() => {
    if (sessionActive) {
      timerRef.current = setInterval(() => {
        setSessionDuration((prev) => prev + 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [sessionActive])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Process transcript when user pauses speaking
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    if (transcript && isRecording && currentSpeaker === "user") {
      // Wait for a pause in speaking (1.5 seconds) before processing
      timeoutId = setTimeout(() => {
        if (transcript.trim().length > 5) {
          processUserSpeech(transcript)
          setTranscript("")
        }
      }, 1500)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [transcript, isRecording, currentSpeaker])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const selectRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * CONVERSATION_TOPICS.length)
    selectTopic(CONVERSATION_TOPICS[randomIndex])
  }

  const selectTopic = (topic: ConversationTopic) => {
    setSelectedTopic(topic)
    setShowTopicSelector(false)
    setMessages([
      {
        role: "assistant",
        content: topic.initialPrompt,
      },
    ])

    // Start the conversation with the AI speaking first
    setTimeout(() => {
      setCurrentSpeaker("assistant")
      speakText(topic.initialPrompt)
      setSessionActive(true)
      setConversationStarted(true)
    }, 500)
  }

  const startUserTurn = () => {
    setCurrentSpeaker("user")

    // Start recording automatically when it's user's turn
    if (recognitionRef.current) {
      recognitionRef.current.start()
      setIsRecording(true)

      toast({
        title: "Your Turn",
        description: "I'm listening! Speak clearly into your microphone.",
      })
    }
  }

  const startAssistantTurn = () => {
    // Stop user recording if it's happening
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }

    setCurrentSpeaker("assistant")
  }

  const processUserSpeech = async (speech: string) => {
    if (!speech.trim()) return

    // Stop recording
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: speech }])
    setInput("")
    setIsProcessing(true)

    try {
      // Call our API to process the speech
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: speech }],
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Add assistant response with any grammar corrections
      setMessages((prev) => [...prev, data])

      // Start the assistant's turn
      startAssistantTurn()

      // Speak the assistant's response
      speakText(data.content)
    } catch (error) {
      console.error("Error processing speech:", error)

      // Add a fallback response when the API fails
      const fallbackResponse = {
        role: "assistant",
        content:
          "I'm sorry, I couldn't process your message. Let's continue our conversation. What would you like to talk about?",
        corrections: [],
      }

      setMessages((prev) => [...prev, fallbackResponse])

      // Start the assistant's turn
      startAssistantTurn()

      // Speak the fallback response
      speakText(fallbackResponse.content)

      toast({
        title: "Connection Issue",
        description: "Using fallback mode for responses. Some features may be limited.",
        variant: "default",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    setIsSpeaking(true)
    setAvatarSpeaking(true)

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-US"
    utterance.rate = 0.9 // Slightly slower for learners

    // Get available voices and try to select a good English voice
    const voices = window.speechSynthesis.getVoices()
    const englishVoices = voices.filter((voice) => voice.lang.includes("en-"))

    if (englishVoices.length > 0) {
      // Prefer female voices for language learning (often clearer)
      const femaleVoice = englishVoices.find((voice) => voice.name.includes("Female"))
      utterance.voice = femaleVoice || englishVoices[0]
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setAvatarSpeaking(false)

      // When the AI finishes speaking, it's the user's turn
      if (currentSpeaker === "assistant" && conversationStarted) {
        setTimeout(() => {
          startUserTurn()
        }, 500)
      }
    }

    window.speechSynthesis.speak(utterance)
  }

  const toggleSpeaking = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setAvatarSpeaking(false)

      // If we interrupt the AI speaking, move to user's turn
      if (currentSpeaker === "assistant") {
        setTimeout(() => {
          startUserTurn()
        }, 500)
      }
    } else {
      // Find the last assistant message and speak it
      const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant")
      if (lastAssistantMessage) {
        startAssistantTurn()
        speakText(lastAssistantMessage.content)
      }
    }
  }

  const endSession = async () => {
    // Stop recording
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }

    // Stop speaking
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setAvatarSpeaking(false)
    }

    setIsProcessing(true)
    setSessionActive(false)
    setCurrentSpeaker(null)

    try {
      // Get all user messages
      const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content)

      if (userMessages.length === 0) {
        toast({
          title: "No Conversation Detected",
          description: "Please have a conversation before requesting feedback.",
        })
        setIsProcessing(false)
        return
      }

      // Call API to generate feedback summary
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: userMessages,
          duration: sessionDuration,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get feedback")
      }

      const feedbackData = await response.json()
      setFeedbackSummary(feedbackData)
      setShowFeedbackSummary(true)
    } catch (error) {
      console.error("Error generating feedback:", error)
      toast({
        title: "Error",
        description: "Failed to generate feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const resetSession = () => {
    setMessages([])
    setShowFeedbackSummary(false)
    setFeedbackSummary(null)
    setSessionDuration(0)
    setCurrentSpeaker(null)
    setConversationStarted(false)
    setShowTopicSelector(true)
    setSelectedTopic(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Group topics by category
  const groupedTopics = CONVERSATION_TOPICS.reduce(
    (acc, topic) => {
      if (!acc[topic.category]) {
        acc[topic.category] = []
      }
      acc[topic.category].push(topic)
      return acc
    },
    {} as Record<string, ConversationTopic[]>,
  )

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b">
        <div className="container flex items-center py-4">
          <Link href="/" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">One-on-One English Practice</h1>
          <div className="ml-auto flex items-center gap-2">
            {sessionActive && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {formatTime(sessionDuration)}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        {showTopicSelector ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Choose a Conversation Topic</h2>
                <p className="text-slate-600">Select a topic to start practicing your English conversation skills</p>
                <Button onClick={selectRandomTopic} className="mt-4 gap-2" size="lg">
                  <Shuffle className="h-4 w-4" />
                  Random Topic
                </Button>
              </div>

              <Tabs defaultValue={Object.keys(groupedTopics)[0]} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  {Object.keys(groupedTopics).map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(groupedTopics).map(([category, topics]) => (
                  <TabsContent key={category} value={category} className="mt-0">
                    <div className="grid md:grid-cols-2 gap-4">
                      {topics.map((topic) => (
                        <Card
                          key={topic.title}
                          className="cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => selectTopic(topic)}
                        >
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-1">{topic.title}</h3>
                            <p className="text-sm text-slate-600">{topic.description}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        ) : !showFeedbackSummary ? (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-3xl mx-auto">
                {/* AI Avatar Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <Avatar className={`h-24 w-24 ${avatarSpeaking ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}>
                      <AvatarImage src="/placeholder.svg?height=96&width=96" alt="AI Assistant" />
                      <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">AI</AvatarFallback>
                    </Avatar>
                    {avatarSpeaking && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Speaking...
                      </div>
                    )}
                  </div>

                  {selectedTopic && (
                    <div className="mt-3 text-center">
                      <Badge variant="outline" className="mb-1">
                        {selectedTopic.category}
                      </Badge>
                      <h2 className="text-lg font-medium">{selectedTopic.title}</h2>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    {currentSpeaker === "assistant" ? (
                      <Badge variant="default" className="animate-pulse">
                        AI is speaking
                      </Badge>
                    ) : currentSpeaker === "user" ? (
                      <Badge variant="secondary" className="animate-pulse">
                        Your turn to speak
                      </Badge>
                    ) : null}
                  </div>
                </div>

                {/* Conversation Section */}
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <Card className={`max-w-[80%] p-4 ${message.role === "user" ? "bg-blue-50" : "bg-white"}`}>
                        <p>{message.content}</p>

                        {message.corrections && message.corrections.length > 0 && (
                          <GrammarFeedback corrections={message.corrections} />
                        )}
                      </Card>
                    </div>
                  ))}

                  {transcript && isRecording && (
                    <div className="flex justify-end">
                      <Card className="max-w-[80%] p-4 bg-blue-50 opacity-70">
                        <p>{transcript}</p>
                      </Card>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            <div className="border-t p-4">
              <div className="max-w-3xl mx-auto">
                <div className="flex justify-center gap-4">
                  {currentSpeaker === "user" ? (
                    <Button
                      onClick={() => {
                        if (isRecording) {
                          recognitionRef.current.stop()
                          setIsRecording(false)
                          if (transcript.trim().length > 5) {
                            processUserSpeech(transcript)
                          } else {
                            startAssistantTurn()
                            speakText(
                              "I didn't hear you clearly. Let me ask again. " +
                                (messages[0]?.content || "What would you like to talk about?"),
                            )
                          }
                        } else {
                          recognitionRef.current.start()
                          setIsRecording(true)
                        }
                      }}
                      variant={isRecording ? "destructive" : "default"}
                      className="h-16 w-16 rounded-full"
                      disabled={isProcessing || currentSpeaker !== "user"}
                    >
                      {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </Button>
                  ) : (
                    <Button
                      onClick={toggleSpeaking}
                      variant={isSpeaking ? "destructive" : "default"}
                      className="h-16 w-16 rounded-full"
                      disabled={isProcessing || !messages.length}
                    >
                      {isSpeaking ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                    </Button>
                  )}
                </div>

                {isRecording && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-blue-600 animate-pulse mb-2">
                      Listening... Speak clearly into your microphone.
                    </p>
                    <div className="flex justify-center">
                      <div className="w-64 h-8 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 h-4 bg-blue-500 rounded-full animate-pulse"
                                style={{
                                  animationDelay: `${i * 0.15}s`,
                                  height: `${Math.random() * 16 + 8}px`,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isProcessing && <p className="text-center text-sm text-slate-500 mt-4">Processing your speech...</p>}

                {messages.length > 1 && !isRecording && !isProcessing && !isSpeaking && (
                  <div className="mt-6 text-center">
                    <Button onClick={endSession} variant="outline">
                      End Session & Get Feedback
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <Card className="p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Conversation Feedback</h2>

                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Fluency</span>
                    <span className="text-sm font-medium">{feedbackSummary?.fluencyScore}/10</span>
                  </div>
                  <Progress
                    value={feedbackSummary?.fluencyScore ? feedbackSummary.fluencyScore * 10 : 0}
                    className="h-2"
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Grammar</span>
                    <span className="text-sm font-medium">{feedbackSummary?.grammarScore}/10</span>
                  </div>
                  <Progress
                    value={feedbackSummary?.grammarScore ? feedbackSummary.grammarScore * 10 : 0}
                    className="h-2"
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Vocabulary</span>
                    <span className="text-sm font-medium">{feedbackSummary?.vocabularyScore}/10</span>
                  </div>
                  <Progress
                    value={feedbackSummary?.vocabularyScore ? feedbackSummary.vocabularyScore * 10 : 0}
                    className="h-2"
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Pronunciation</span>
                    <span className="text-sm font-medium">{feedbackSummary?.pronunciationScore}/10</span>
                  </div>
                  <Progress
                    value={feedbackSummary?.pronunciationScore ? feedbackSummary.pronunciationScore * 10 : 0}
                    className="h-2"
                  />
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">Strengths</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {feedbackSummary?.strengths.map((strength, index) => (
                      <li key={index} className="text-green-700">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Areas to Improve</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {feedbackSummary?.areasToImprove.map((area, index) => (
                      <li key={index} className="text-orange-700">
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Overall Feedback</h3>
                  <p className="text-slate-700">{feedbackSummary?.overallFeedback}</p>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-500 mb-4">Session duration: {formatTime(sessionDuration)}</p>
                  <Button onClick={resetSession} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Start New Session
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
