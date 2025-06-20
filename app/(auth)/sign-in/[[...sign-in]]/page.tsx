import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return <div className="flex flex-col items-center justify-center gap-4 p-4">
    <h1 className="font-semibold text-4xl">Bienvenido de vuelta! 👋</h1>
    <p className="text-xl">Ingresa tus credenciales para continuar</p>

    <SignIn />
    </div>
}
