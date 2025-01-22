export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to PM
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Project Management made simple
        </p>
        <a
          href="/auth/login"
          className="inline-block px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
        >
          Sign In
        </a>
      </div>
    </main>
  );
}
