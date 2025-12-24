'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function createCheckoutSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // IMPORTANT: Replace with your actual Price ID from Stripe Dashboard
        price: 'price_1Sh2wTRtzRlJnXXArXhbkFa4', 
        quantity: 1,
      },
    ],
    mode: 'subscription',
    // We use environment variables for the URLs to ensure it works in production
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/fitness?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/fitness?canceled=true`,
    metadata: {
      supabase_user_id: user.id,
    },
  })

  if (!session.url) throw new Error("Could not create Stripe session")

  // This sends the user to the Stripe hosted checkout page
  redirect(session.url)
}