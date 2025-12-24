import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover', // Match your dashboard version
})

// Use Service Role Key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

async function setPremiumByUserId(userId: string, customerId: string) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_premium: true, stripe_customer_id: customerId })
    .eq('id', userId)

  if (error) {
    console.error('❌ Supabase update (by user id) failed:', error.message)
    throw error
  }

  console.log(`✅ Premium granted for user ${userId}, customer ${customerId}`)
}

async function setPremiumByCustomerId(customerId: string, isActive: boolean) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_premium: isActive })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('❌ Supabase update (by customer id) failed:', error.message)
    throw error
  }

  console.log(`✅ Premium ${isActive ? 'enabled' : 'revoked'} for customer ${customerId}`)
}

export async function POST(req: Request) {
  const body = await req.text() // Read the body ONCE
  const headersList = await headers()

  const signature = headersList.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ Missing signature or webhook secret')
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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const customerId = session.customer as string

        if (userId && customerId) {
          await setPremiumByUserId(userId, customerId)
        } else {
          console.warn('⚠️ Missing userId or customerId on checkout.session.completed', {
            userId,
            customerId,
          })
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const isActive = ['active', 'trialing', 'past_due'].includes(subscription.status)
        await setPremiumByCustomerId(customerId, isActive)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        await setPremiumByCustomerId(customerId, false)
        break
      }
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
    }
  } catch (err: any) {
    return new NextResponse(`Handler Error: ${err.message}`, { status: 500 })
  }

  return NextResponse.json({ received: true })
}