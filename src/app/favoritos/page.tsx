import type { Metadata } from 'next'
import { RequiresAccount } from '@/components/requires-account'

export const metadata: Metadata = { title: 'Favoritos' }

export default function FavoritesPage() {
  return (
    <RequiresAccount
      testId="favorites-requires-account"
      title="Favoritos"
      description="Guarda activos para seguirlos y comparar antes de decidir."
      detail="Los favoritos se asocian a tu cuenta para que los tengas disponibles en web, iOS y Android. La cuenta de usuario se habilita con el modulo de registro e inicio de sesion."
    />
  )
}
