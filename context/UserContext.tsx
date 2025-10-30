// context/UserContext.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"

type UserContextType = {
  uid: string | null
  setUid: (uid: string | null) => void
}

const UserContext = createContext<UserContextType>({
  uid: null,
  setUid: () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [uid, setUid] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me")
        const data = await res.json()
        setUid(data.uid)
      } catch {
        setUid(null)
      }
    }
    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ uid, setUid }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUid = () => useContext(UserContext)
