import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Inscription</h1>
        <p className="text-slate-300">Créez votre compte gratuitement</p>
      </div>
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}
