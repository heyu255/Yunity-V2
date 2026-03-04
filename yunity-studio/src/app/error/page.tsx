export default function ErrorPage() {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-xl font-bold">Authentication Error</h1>
        <p>Something went wrong. Please check your credentials and try again.</p>
        <a href="/login" className="mt-4 text-slate-700 underline">Back to Login</a>
      </div>
    )
  }