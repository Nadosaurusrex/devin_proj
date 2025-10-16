export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Feature Flag Removal Dashboard</h1>
      <p className="text-gray-600">
        Automated feature flag analysis and removal powered by Devin AI.
      </p>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Getting Started</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Connect to your GitHub repository</li>
          <li>View and analyze feature flags</li>
          <li>Trigger automated removal via Devin</li>
          <li>Review and merge the generated PR</li>
        </ol>
      </div>
      <div className="pt-4">
        <a
          href="/connect"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Connect Repository
        </a>
      </div>
    </div>
  )
}
