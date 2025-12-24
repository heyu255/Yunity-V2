'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// 1. This interface tells TypeScript exactly what the button can accept
interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export default function SubmitButton({ 
  children, 
  className, 
  ...props // This "rest" operator collects type="submit" and other props
}: SubmitButtonProps) {
  
  const { pending } = useFormStatus()

  const handleClick = () => {
    if (!pending) {
      toast.success("Profile Updated", {
        description: "Your changes have been saved successfully.",
      })
    }
  }

  return (
    <Button 
      {...props} // This passes type="submit" to the actual button
      disabled={pending}
      onClick={handleClick}
      className={cn("relative", className)}
    >
      {pending ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  )
}