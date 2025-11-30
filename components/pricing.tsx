'use client'

import { motion } from 'framer-motion'

export function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '$9',
      period: '/month',
      description: 'Perfect for trying Rusaldo',
      features: [
        '5 videos per month',
        'Basic interests',
        '480p video quality',
        'Standard support',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For serious learners',
      features: [
        '50 videos per month',
        'All interests',
        '1080p video quality',
        'Priority support',
        'Custom branding',
        'Analytics dashboard',
      ],
      cta: 'Get Started',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For organizations',
      features: [
        'Unlimited videos',
        'Team management',
        '4K video quality',
        'Dedicated support',
        'API access',
        'Advanced analytics',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your learning needs. All plans include a 14-day free trial.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`rounded-2xl p-8 flex flex-col ${
                plan.highlighted
                  ? 'bg-primary/10 border-2 border-primary relative -mt-4'
                  : 'bg-card border border-border'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Recommended
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <button
                className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all ${
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground hover:shadow-lg'
                    : 'bg-secondary/20 text-foreground hover:bg-secondary/30'
                } cursor-pointer`}
              >
                {plan.cta}
              </button>

              <ul className="space-y-4 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I change plans anytime?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, all plans include a 14-day free trial. No credit card required to get started.',
              },
              {
                q: 'What happens if I exceed my video limit?',
                a: 'You can purchase additional video credits, or upgrade to a higher plan for more videos included.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-2 text-foreground">{item.q}</h3>
                <p className="text-muted-foreground text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
