export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
      <div className="text-center text-white px-4">
        <h1 className="text-5xl font-bold mb-4">GitoLink</h1>
        <p className="text-xl mb-8 opacity-90">Your personal link hub. Share everything you create.</p>
        <div className="flex gap-4 justify-center">
          <a
            href="/auth/register"
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Get Started
          </a>
          <a
            href="/auth/login"
            className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}