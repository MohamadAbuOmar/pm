import { LoginForm } from '@/components/auth/login/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
