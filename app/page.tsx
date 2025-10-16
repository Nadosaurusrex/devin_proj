'use client'

import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const features = [
    {
      icon: 'pi-github',
      title: 'GitHub Integration',
      description: 'Seamlessly connect to your GitHub repositories and analyze feature flag registries',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      delay: 0.1
    },
    {
      icon: 'pi-search',
      title: 'Smart Analysis',
      description: 'AI-powered analysis finds all flag references with confidence scoring and risk assessment',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      delay: 0.2
    },
    {
      icon: 'pi-bolt',
      title: 'Automated Removal',
      description: 'Devin AI safely removes flags, inlines behavior, and creates ready-to-merge PRs',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      delay: 0.3
    },
    {
      icon: 'pi-check-circle',
      title: 'Safe & Tested',
      description: 'Runs your tests and builds before creating PRs, ensuring code quality',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      delay: 0.4
    }
  ]

  const steps = [
    { number: '1', text: 'Connect to your GitHub repository', icon: 'pi-link' },
    { number: '2', text: 'View and analyze feature flags', icon: 'pi-eye' },
    { number: '3', text: 'Trigger automated removal via Devin', icon: 'pi-cog' },
    { number: '4', text: 'Review and merge the generated PR', icon: 'pi-check' }
  ]

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-8"
      >
        <div className="inline-block mb-4">
          <i className="pi pi-flag-fill text-6xl text-blue-600 float-animation"></i>
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Feature Flag Removal Dashboard
        </h1>
        <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
          Automated feature flag analysis and removal powered by <strong>Devin AI</strong>.
          Clean up your codebase with confidence.
        </p>
        <Button
          label="Get Started"
          icon="pi pi-arrow-right"
          iconPos="right"
          className="p-button-lg pulse-glow"
          onClick={() => router.push('/connect')}
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
        />
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: feature.delay }}
          >
            <Card
              className="h-full hover:shadow-lg transition-all cursor-pointer bounce-in"
              style={{ animation: `bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${feature.delay}s` }}
            >
              <div className="text-center">
                <div className={`inline-flex align-items-center justify-content-center ${feature.bgColor} border-circle mb-3`} style={{ width: '60px', height: '60px' }}>
                  <i className={`pi ${feature.icon} ${feature.color}`} style={{ fontSize: '2rem' }}></i>
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Getting Started Section */}
      <Card className="mt-6">
        <h2 className="text-3xl font-bold mb-6 text-center">
          <i className="pi pi-play-circle mr-2 text-blue-600"></i>
          Getting Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="flex flex-column align-items-center text-center"
            >
              <div
                className="flex align-items-center justify-content-center bg-gradient-to-r from-blue-600 to-purple-600 text-white border-circle mb-3 font-bold pulse-glow"
                style={{ width: '50px', height: '50px', fontSize: '1.5rem' }}
              >
                {step.number}
              </div>
              <i className={`pi ${step.icon} text-3xl text-blue-600 mb-2`}></i>
              <p className="text-gray-700">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6"
      >
        <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100">
          <i className="pi pi-bolt text-4xl text-blue-600 mb-2"></i>
          <h3 className="text-3xl font-bold text-blue-600">Fast</h3>
          <p className="text-gray-600">Automated analysis in minutes</p>
        </Card>
        <Card className="text-center bg-gradient-to-br from-green-50 to-green-100">
          <i className="pi pi-shield text-4xl text-green-600 mb-2"></i>
          <h3 className="text-3xl font-bold text-green-600">Safe</h3>
          <p className="text-gray-600">Tests run before every PR</p>
        </Card>
        <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100">
          <i className="pi pi-star text-4xl text-purple-600 mb-2"></i>
          <h3 className="text-3xl font-bold text-purple-600">Smart</h3>
          <p className="text-gray-600">AI-powered code analysis</p>
        </Card>
      </motion.div>
    </div>
  )
}
