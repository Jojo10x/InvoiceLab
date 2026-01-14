import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import Dashboard from "./components/Dashboard";
import { ChatAssistant } from "./components/ChatAssistant";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="flex justify-between items-center p-4 bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">I</div>
          <h1 className="text-xl font-bold text-gray-800">InvoiceLab</h1>
        </div>

        <div className="flex gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-gray-600 hover:text-blue-600">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <main className="mt-6">
        <SignedOut>
          <div className="flex flex-col items-center justify-center pt-20 px-4">
            <h2 className="text-4xl font-extrabold mb-4 text-center tracking-tight">
              Automate Your Accounts Payable
            </h2>
            <p className="text-gray-500 mb-8 text-center max-w-md text-lg">
              Upload invoices, extract data, and detect fraud instantly using our 5-Agent AI system.
            </p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Start for Free
              </button>
            </SignInButton>
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