import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover', // Match your dashboard version
})

// Use Service Role Key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
)

export async function POST(req: Request) {
  const body = await req.text() // Read the body ONCE
  const headersList = await headers()
  
  // FIX 1: Headers are normalized to lowercase in Vercel/Next.js
  const signature = headersList.get('stripe-signature') 

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("❌ Missing signature or webhook secret")
    return new NextResponse('Missing signature or secret', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    console.error(`❌ Webhook Signature Error: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.supabase_user_id

    if (userId) {
      console.log(`✅ Payment confirmed for user: ${userId}`)
      
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', userId)

      if (error) {
        console.error('❌ Supabase Update Error:', error.message)
        return new NextResponse('Database update failed', { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}