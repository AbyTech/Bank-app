import React, { useRef, useEffect } from 'react'

/**
 * Secure 4-digit numeric PIN input.
 * Renders separate masked boxes with auto-advance, backspace navigation and
 * paste support. Never logs or stores the value itself - it is fully
 * controlled by the parent.
 */
const PinInput = ({ value = '', onChange, onComplete, autoFocus = false, disabled = false, length = 4 }) => {
  const inputsRef = useRef([])

  const valueArr = String(value || '').split('')

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index, e) => {
    const digit = e.target.value.replace(/\D/g, '')
    if (!digit) {
      handleKeyDown(index, { key: 'Backspace' })
      return
    }

    const next = valueArr.slice()
    next[index] = digit.slice(-1)
    const nextValue = next.join('')
    onChange(nextValue)

    if (nextValue.length === length) {
      onComplete?.(nextValue)
    } else if (inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = valueArr.slice()
      if (next[index]) {
        next[index] = ''
        onChange(next.join(''))
      } else if (index > 0) {
        next[index - 1] = ''
        onChange(next.join(''))
        inputsRef.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    onChange(pasted)
    if (pasted.length === length) {
      onComplete?.(pasted)
    } else {
      inputsRef.current[Math.min(pasted.length, length - 1)]?.focus()
    }
  }

  const handleFocus = (e) => e.target.select()

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el }}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={1}
          value={valueArr[index] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={handleFocus}
          aria-label={`PIN digit ${index + 1}`}
          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl bg-primary-100 dark:bg-primary-700 border border-silver/60 dark:border-primary-600 text-primary dark:text-cream focus:ring-2 focus:ring-gold focus:border-transparent transition-all disabled:opacity-60"
        />
      ))}
    </div>
  )
}

export default PinInput
