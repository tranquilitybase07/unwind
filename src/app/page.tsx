import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F3F0]">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 bg-white shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 3.5L13 2v6l-3 1.5L7 8V2l3 1.5z" />
              <path d="M10 11l3-1.5v6l-3 1.5-3-1.5v-6L10 11z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-900">Healpoint</span>
        </div>

        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="text-gray-900 font-medium hover:text-gray-600"
          >
            Dashboard
          </Link>
          <Link href="/hero" className="text-gray-900 font-medium hover:text-gray-600">
            Hero
          </Link>
          <a href="#" className="text-gray-900 font-medium hover:text-gray-600">
            Treatments
          </a>
          <button className="text-gray-900 font-medium hover:text-gray-600">
            EN ▼
          </button>
        </div>

        <button className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800">
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <main className="px-8 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* <div className="inline-block">
              <span className="px-4 py-2 border-2 border-gray-900 rounded-full text-sm font-medium text-gray-900 uppercase tracking-wide">
                Mental Health at 30's
              </span>
            </div> */}

            <h1 className="text-7xl font-bold leading-tight">
              <span className="text-[#8B5A3C] block">Mental</span>
              <span className="text-[#8B5A3C] block">health</span>
              <span className="text-gray-900 block">is</span>
              <span className="text-gray-900 block">wealth</span>
            </h1>

            <div className="flex items-start gap-4 max-w-md">
              <p className="text-lg text-gray-700 leading-relaxed">
                To live your life to the fullest, we're continuing to find ways
                to prevent mental health problems.
              </p>
            </div>
          </div>

          {/* Right Content - Image Grid */}
          <div className="relative">
            {/* Top Left - Yellow card */}
            <div className="absolute top-0 left-0 w-56 h-64 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-3xl shadow-lg overflow-hidden transform -rotate-3">
              <Image
                src="/images/leaf_1.png"
                alt="background"
                width={500}
                height={500}
                className="absolute  bottom-10 right-10 z-0 mix-blend-color-burn opacity-10"
              />

              <Image
                src="/images/1.png"
                alt="Happy person"
                width={224}
                height={256}
                className="absolute z-10 w-full h-full object-cover"
              />
              <div className="absolute z-20 top-4 right-4 bg-yellow-200 px-3 py-1 rounded-full text-sm font-semibold">
                Happier
              </div>
            </div>

            {/* Top Right - Green card with badge */}
            <div className="absolute top-8 right-0 w-56 h-64 bg-gradient-to-br from-green-300 to-green-400 rounded-3xl shadow-lg overflow-hidden transform rotate-6">
              <Image
                src="/images/leaf_2.png"
                alt="background"
                width={500}
                height={500}
                className="absolute min-w-full h-full  bottom-10 left-10 z-0 mix-blend-color-burn opacity-10"
              />
              <Image
                src="/images/2.png"
                alt="Calm person"
                width={224}
                height={256}
                className="absolute z-10 w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                Calm
              </div>
              <div className="absolute bottom-4 right-4 bg-orange-400 px-4 py-2 rounded-lg shadow-md">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <span className="text-orange-400 text-xs">✓</span>
                  </div>
                  <div className="text-xs font-medium">━━</div>
                </div>
              </div>
            </div>

            {/* Bottom Center - Purple card */}
            <div className="absolute top-32 left-12 w-64 h-72 bg-gradient-to-br from-purple-400 to-purple-500 rounded-3xl shadow-lg overflow-hidden transform -rotate-2">
              <Image
                src="/images/3.png"
                alt="Positive person"
                width={256}
                height={288}
                className="w-full h-full object-cover"
              />

              <div className="absolute -bottom-8 right-8 bg-purple-300 px-3 py-1 rounded-full text-sm font-semibold">
                Positive
              </div>
            </div>

            {/* Decorative Elements */}
            <svg
              className="absolute top-4 right-40 w-8 h-8 text-orange-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>

            <svg
              className="absolute bottom-16 right-4 w-10 h-10 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>

            {/* Wavy line decoration */}
            <svg
              className="absolute bottom-0 right-24 w-24 h-12"
              viewBox="0 0 100 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                d="M0 25 Q 25 10, 50 25 T 100 25"
                className="text-gray-900"
              />
            </svg>

            {/* Spacer for absolute positioning */}
            <div className="h-96"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
