// context/UserContext.tsx
"use client"

import { User } from "@/models/user"
import { createContext, useContext, useEffect, useState } from "react"

type UserContextType = {
  user: User | null
  setUser: (uid: User | null) => void
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user")
        const data = await res.json()
        
        setUser(data.user)
      } catch {
        setUser(null)
      }
    }
    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
