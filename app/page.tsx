function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}

import { Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold">SpeakBetter</h1>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="font-medium">
              Home
            </Link>
            <Link href="#features" className="font-medium">
              Features
            </Link>
            <Link href="#how-it-works" className="font-medium">
              How it works
            </Link>
          </nav>
          <div className="flex gap-2">
            <Button variant="outline">Sign In</Button>
            <Button>Sign Up</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
              Improve Your English Through Natural Conversation
            </h1>
            <p className="mt-6 text-xl text-slate-600 max-w-2xl">
              Practice speaking English with our AI assistant that provides real-time feedback on grammar,
              pronunciation, and vocabulary.
            </p>
            <div className="mt-10">
              <Link href="/chat">
                <Button size="lg" className="text-lg px-8">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Practicing
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="Natural Conversations"
                description="Practice English in realistic scenarios with our AI assistant that responds naturally to your speech."
              />
              <FeatureCard
                title="Grammar Correction"
                description="Receive instant feedback on grammatical errors and suggestions for improvement."
              />
              <FeatureCard
                title="Pronunciation Feedback"
                description="Get feedback on your pronunciation and tips to sound more natural."
              />
              <FeatureCard
                title="Vocabulary Building"
                description="Learn new words and phrases in context during your conversations."
              />
              <FeatureCard
                title="Progress Tracking"
                description="Monitor your improvement over time with detailed progress reports."
              />
              <FeatureCard
                title="Multiple Difficulty Levels"
                description="Practice at your own pace with adjustable difficulty settings."
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 bg-slate-50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <StepCard
                number="1"
                title="Choose a Topic"
                description="Select from various conversation topics or create your own."
              />
              <StepCard
                number="2"
                title="Start Speaking"
                description="Have a natural conversation with our AI assistant using your microphone."
              />
              <StepCard
                number="3"
                title="Get Feedback"
                description="Receive instant feedback on your grammar, pronunciation, and vocabulary."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-white">
        <div className="container text-center text-slate-600">
          <p>© 2024 SpeakBetter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
