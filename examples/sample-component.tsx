/**
 * Example React Component from V0.dev
 * This demonstrates a typical V0 component with Tailwind CSS
 */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center p-12 bg-white">
        <h1 className="text-5xl font-bold text-gray-900 text-center mb-4">
          Welcome to Our Amazing Product
        </h1>
        <p className="text-xl text-gray-600 text-center max-w-2xl mb-8">
          Transform your React designs into beautiful Elementor templates with
          just one command. Fast, reliable, and production-ready.
        </p>
        <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition">
          Get Started Now
        </button>
      </section>

      {/* Features Section */}
      <section className="p-12 bg-gray-100">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
          Key Features
        </h2>
        <div className="flex flex-row gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="flex-1 bg-white p-6 rounded-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Fast Conversion
            </h3>
            <p className="text-gray-700">
              Convert your entire React project in seconds with our optimized
              AST parsing engine.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex-1 bg-white p-6 rounded-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Style Mapping
            </h3>
            <p className="text-gray-700">
              Automatically converts Tailwind classes and inline styles to
              Elementor settings.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex-1 bg-white p-6 rounded-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Type Safe
            </h3>
            <p className="text-gray-700">
              Built with TypeScript for maximum reliability and developer
              experience.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="flex flex-col items-center p-12 bg-blue-600">
        <h2 className="text-4xl font-bold text-white text-center mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-blue-100 text-center mb-8">
          Install now and start converting your React components
        </p>
        <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg">
          Download CLI
        </button>
      </section>
    </div>
  );
}
