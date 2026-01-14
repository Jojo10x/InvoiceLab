import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import Dashboard from "./components/Dashboard";
import { ChatAssistant } from "./components/ChatAssistant";
import { Zap, Shield, Clock, ArrowRight } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm border-b sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            InvoiceLab
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="cursor-pointer group bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium text-sm shadow-sm hover:shadow inline-flex items-center gap-2">
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <main className="mt-6">
        <SignedOut>
          <div className="max-w-5xl mx-auto px-4 py-16">
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-4 py-2 bg-blue-50 rounded-full">
                <span className="text-blue-600 text-sm font-medium">5-Agent AI System</span>
              </div>
              <h2 className="text-5xl font-extrabold mb-6 text-gray-900 tracking-tight">
                Stop Manual Data Entry.
                <span className="block text-blue-600 mt-2">Start Automating.</span>
              </h2>
              <p className="text-gray-600 mb-10 text-lg max-w-2xl mx-auto leading-relaxed">
                Upload invoices, extract data, and detect fraud instantly.
                Transform hours of manual work into seconds with intelligent automation.
              </p>
              <SignInButton mode="modal">
                <button className="group bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-medium shadow-lg hover:shadow-xl inline-flex items-center gap-2">
                  Start for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignInButton>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-20">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Instant Extraction</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  AI-powered data extraction captures invoice details in seconds with 99% accuracy.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Fraud Detection</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Advanced algorithms identify suspicious patterns and protect your business.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Save Hours Daily</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Automate repetitive tasks and focus on what matters most to your business.
                </p>
              </div>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <Dashboard />
          <ChatAssistant />
        </SignedIn>
      </main>
    </div>
  );
}

export default App;