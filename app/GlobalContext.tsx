// GlobalContext.tsx
import React, { createContext, useContext, useState } from 'react'

type GlobalContextType = {
  globalVar: string
  setGlobalVar: (value: string) => void
}

// Create the context
const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

// Create a provider
export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [globalVar, setGlobalVar] = useState('default value')

  return (
    <GlobalContext.Provider value={{ globalVar, setGlobalVar }}>
      {children}
    </GlobalContext.Provider>
  )
}

// Custom hook to use the context
export const useGlobal = () => {
  const context = useContext(GlobalContext)
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider')
  }
  return context
}
