import React from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Globe,
  SlidersHorizontal,
  Zap,
  ChevronDown,
  CreditCard,
  Sparkles,
  MapPin,
  Truck,
  CheckCircle2,
} from 'lucide-react'
import Button from '../../components/UI/Button'
import DebitCard from '../../components/UI/DebitCard'

const CATEGORY_VARIANTS = {
  standard: { variant: 'teal', chip: 'bg-primary-600/10 text-primary-600 dark:text-gold-300 border-primary-600/30' },
  gold: { variant: 'gold', chip: 'bg-gold/10 text-gold border-gold/40' },
  platinum: { variant: 'platinum', chip: 'bg-slate-500/10 text-slate-500 dark:text-slate-300 border-slate-500/40' },
  black: { variant: 'black', chip: 'bg-gray-800/10 text-gray-800 dark:text-cream border-gray-800/40' },
}

const VIRTUAL_BENEFITS = [
  { icon: ShieldCheck, title: 'Secure Payments', desc: 'Protect your main account with separate virtual cards.' },
  { icon: Globe, title: 'Global Acceptance', desc: 'Use anywhere major cards are accepted online.' },
  { icon: SlidersHorizontal, title: 'Spending Controls', desc: 'Set limits and monitor transactions in real-time.' },
  { icon: Zap, title: 'Instant Issuance', desc: 'Create and use cards within minutes.' },
]

const VIRTUAL_STEPS = [
  { step: '1', title: 'Apply', desc: 'Complete the application form for your virtual card. Select your preferred card type and set your spending limits.' },
  { step: '2', title: 'Activate', desc: 'Once approved, your virtual card will be ready to use. View the card details and activate it from your dashboard.' },
  { step: '3', title: 'Use', desc: 'Use your virtual card for online transactions anywhere major credit cards are accepted. Monitor transactions in real-time.' },
]

const VIRTUAL_FAQ = [
  {
    q: 'What is a virtual card?',
    a: 'A virtual card is a digital payment card that can be used for online transactions. It works similarly to a physical card but exists only in digital form, providing enhanced security for online purchases.',
  },
  {
    q: 'How secure are virtual cards?',
    a: 'Virtual cards offer additional security because they are separate from your primary account. You can create cards with specific spending limits and, where supported, single-use cards for enhanced protection against fraud.',
  },
  {
    q: 'Can I have multiple virtual cards?',
    a: 'Yes, you can apply for multiple virtual cards for different purposes, such as subscriptions, shopping, and other online payments. Each card can have its own limits and settings.',
  },
  {
    q: 'How long does it take to get a virtual card?',
    a: 'Virtual cards are typically issued within minutes after approval. Once approved, you can immediately view and use the card details for online transactions.',
  },
  {
    q: 'How soon will my virtual card be ready?',
    a: 'Virtual cards are typically issued within minutes after approval. You\u2019ll receive a notification when your card is ready to use.',
  },
  {
    q: 'Can I use my virtual card for all online purchases?',
    a: 'Yes, your virtual card works for most online merchants that accept Visa or Mastercard. However, some merchants may require a physical card for verification or other purposes.',
  },
]

const FAQ = ({ items }) => {
  const [openIndex, setOpenIndex] = React.useState(0)

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div
            key={item.q}
            className="rounded-2xl bg-white dark:bg-primary-700/50 border border-silver/30 dark:border-primary-600 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="font-medium text-sm sm:text-base text-primary dark:text-cream">{item.q}</span>
              <ChevronDown
                size={18}
                className={`text-gold shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4 -mt-1">
                <p className="text-sm text-silver leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const CategoryCard = ({ category, index, onSelect }) => {
  const style = CATEGORY_VARIANTS[category.id] || CATEGORY_VARIANTS.standard
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl bg-white dark:bg-primary-800 border border-silver/30 dark:border-primary-600 shadow-lux-card overflow-hidden flex flex-col"
    >
      <div className="p-4 pb-0">
        <DebitCard
          cardNumber=""
          cardName="PRIMEWAVE"
          expiry="--/--"
          variant={style.variant}
          categoryLabel={category.name}
        />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-heading font-semibold text-lg text-primary dark:text-cream">{category.name}</h4>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${style.chip}`}>
            ${category.fee.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-silver mb-4">{category.tagline}</p>

        <ul className="space-y-2 mb-5 flex-1">
          {category.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-primary dark:text-cream/90">
              <CheckCircle2 size={15} className="text-success shrink-0 mt-0.5" />
              {benefit}
            </li>
          ))}
        </ul>

        <Button variant="brand" className="w-full" onClick={() => onSelect(category)}>
          <Sparkles size={16} className="mr-2" />
          Apply for {category.name}
        </Button>
      </div>
    </motion.div>
  )
}

const CardCatalog = ({ type, categories, onSelectCategory }) => {
  const isVirtual = type === 'virtual'
  const list = categories[type] || []

  return (
    <div className="space-y-10">
      {/* Intro */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 p-6 sm:p-10 text-white">
        <div className="pointer-events-none absolute -top-20 -right-16 w-64 h-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 w-56 h-56 rounded-full bg-primary-500/30 blur-3xl" />
        <div className="relative max-w-2xl">
          {isVirtual ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={20} className="text-gold-300" />
                <span className="text-xs font-bold tracking-[0.25em] text-gold-300 uppercase">Virtual Cards</span>
              </div>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl mb-3">Virtual Cards Made Easy</h3>
              <p className="text-white/75 text-sm sm:text-base leading-relaxed">
                Create virtual cards for secure online payments, subscription management, and more. Our virtual cards offer enhanced security and control over your spending.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Truck size={20} className="text-gold-300" />
                <span className="text-xs font-bold tracking-[0.25em] text-gold-300 uppercase">Physical Cards</span>
              </div>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl mb-3">Premium Physical Cards</h3>
              <p className="text-white/75 text-sm sm:text-base leading-relaxed">
                Physical cards are delivered to the address you provide. Choose a tier that matches your lifestyle — each category has its own design, pricing and benefits.
              </p>
              <div className="mt-5 flex items-start gap-3 bg-white/10 border border-white/15 rounded-xl p-4">
                <MapPin size={18} className="text-gold-300 shrink-0 mt-0.5" />
                <p className="text-white/80 text-sm">
                  Your card will be shipped to the full delivery address you provide during the application. Please make sure all delivery information is accurate.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Benefits (virtual only) */}
      {isVirtual && (
        <>
          <div>
            <h3 className="font-heading font-semibold text-xl sm:text-2xl text-primary dark:text-cream mb-5">Benefits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {VIRTUAL_BENEFITS.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-2xl bg-white dark:bg-primary-800 border border-silver/30 dark:border-primary-600 p-5"
                >
                  <div className="w-11 h-11 rounded-xl bg-gold/15 text-gold flex items-center justify-center mb-3">
                    <benefit.icon size={20} />
                  </div>
                  <h4 className="font-semibold text-primary dark:text-cream mb-1">{benefit.title}</h4>
                  <p className="text-sm text-silver">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div>
            <h3 className="font-heading font-semibold text-xl sm:text-2xl text-primary dark:text-cream mb-5">How Virtual Cards Work</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {VIRTUAL_STEPS.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="relative rounded-2xl bg-white dark:bg-primary-800 border border-silver/30 dark:border-primary-600 p-6"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center font-heading font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <h4 className="font-semibold text-primary dark:text-cream mb-1">{step.title}</h4>
                  <p className="text-sm text-silver leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Issuance fee + categories */}
      <div>
        <h3 className="font-heading font-semibold text-xl sm:text-2xl text-primary dark:text-cream mb-2">Card Issuance Fee</h3>
        <p className="text-sm text-silver mb-5">
          There is a one-time issuance fee for your new {isVirtual ? 'virtual' : 'physical'} card. The fee will be paid to the bank through another account, because the account is inactive for now and not able to make transactions, and it will be ready to make transactions once the card is paid for. Please contact our support team for the payment details.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {list.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              onSelect={onSelectCategory}
            />
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="font-heading font-semibold text-xl sm:text-2xl text-primary dark:text-cream mb-5">
          {isVirtual ? 'Frequently Asked Questions' : 'Physical Card Information'}
        </h3>
        {isVirtual ? (
          <FAQ items={VIRTUAL_FAQ} />
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white dark:bg-primary-700/50 border border-silver/30 dark:border-primary-600 p-5 flex items-start gap-3">
              <Truck size={20} className="text-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-primary dark:text-cream mb-1">Delivery</h4>
                <p className="text-sm text-silver">
                  Physical cards are delivered to the address you provide during the application. We recommend entering an accurate, complete delivery address.
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-primary-700/50 border border-silver/30 dark:border-primary-600 p-5 flex items-start gap-3">
              <ShieldCheck size={20} className="text-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-primary dark:text-cream mb-1">Security</h4>
                <p className="text-sm text-silver">
                  Physical cards include an EMV chip and contactless payments. Each card has its own secure card PIN, completely separate from your transaction PIN.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CardCatalog
