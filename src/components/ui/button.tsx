import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex w-full cursor-pointer items-center justify-center rounded-lg text-[13px] font-medium transition-all duration-300 outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-none bg-white py-3.5 font-semibold text-black hover:-translate-y-px hover:opacity-90 active:translate-y-0',
        outline:
          'border border-[#1c1c1e] bg-transparent py-3.5 text-[#a1a1aa] hover:border-[#2c2c2e] hover:bg-white/[0.01] hover:text-white',
        ghost:
          'border-none bg-transparent px-2 py-1 text-[11px] text-[#a1a1aa] hover:bg-white/5 hover:text-white',
      },
      size: {
        default: 'h-auto',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
