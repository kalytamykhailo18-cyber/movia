import type { Metadata } from 'next'
import { RequiresAccount } from '@/components/requires-account'

export const metadata: Metadata = { title: 'Mensajes' }

export default function MessagesPage() {
  return (
    <RequiresAccount
      testId="messages-requires-account"
      title="Mensajes"
      description="Conversaciones entre comprador y vendedor dentro de MOVIA."
      detail="El chat interno se asocia a tu cuenta y queda registrado como contacto en la analitica del vendedor. Los contactos que ya se generan por WhatsApp, chat y correo se ven en Mi Empresa, en Contactos recibidos."
    />
  )
}
