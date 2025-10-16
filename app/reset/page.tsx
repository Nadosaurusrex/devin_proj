'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { motion } from 'framer-motion'

export default function ResetPage() {
  const router = useRouter()
  const [resetComplete, setResetComplete] = useState(false)

  useEffect(() => {
    // Clear localStorage on mount
    localStorage.clear()
    setResetComplete(true)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto text-center py-12"
    >
      <Card>
        <i className="pi pi-refresh text-6xl text-blue-600 mb-4 block"></i>
        <h1 className="text-4xl font-bold mb-4">Reset Complete</h1>

        {resetComplete && (
          <Message
            severity="success"
            text="All local storage data has been cleared successfully!"
            className="w-full mb-4"
          />
        )}

        <p className="text-gray-600 mb-6">
          Your repository configuration has been cleared. You can now connect to a new repository.
        </p>

        <div className="flex gap-3 justify-content-center">
          <Button
            label="Connect Repository"
            icon="pi pi-link"
            onClick={() => router.push('/connect')}
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
          />
          <Button
            label="Go Home"
            icon="pi pi-home"
            outlined
            onClick={() => router.push('/')}
          />
        </div>
      </Card>
    </motion.div>
  )
}
