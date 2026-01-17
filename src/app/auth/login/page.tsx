import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F3F0] p-4">
      <Link href="/" className="mb-8">
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
          <span className="text-2xl font-bold text-gray-900">Unwind</span>
        </div>
      </Link>

      <LoginForm />

      <p className="mt-8 text-sm text-gray-600">
        By signing in, you agree to our{' '}
        <Link href="/terms" className="text-blue-600 hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-blue-600 hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}
