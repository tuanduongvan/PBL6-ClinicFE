import { HomeClientWrapper } from '@/components/home-client-wrapper'
import { User } from '@/types/auth'

/**
 * Home Page - Server Component
 * 
 * This is the main landing page for the clinic. It uses a client wrapper
 * for interactive features while maintaining server-side rendering benefits.
 */
export default function Home() {
  // In a real app, you might fetch initial user data here on the server
  // For now, we'll pass null and let the client-side auth handle it
  const initialUser: User | null = null

  return <HomeClientWrapper initialUser={initialUser} />
}

