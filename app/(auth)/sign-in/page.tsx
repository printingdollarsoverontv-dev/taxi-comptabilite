import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Connexion</h1>
        <p className="text-slate-300">Accédez à votre compte TaxiCompta</p>
      </div>
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
