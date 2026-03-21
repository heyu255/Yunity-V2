'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles, Plus, Pencil, Trash2, Check, X,
  Loader2, ChevronDown, ChevronUp, Utensils, Flame, Settings2,
  Clock, History
} from 'lucide-react'
import { saveMealLog, generateMealIdea, estimateNutrition, type MealEntry, type MealIdea, type PastLog, type FrequentMeal } from './nutrition-actions'
import { toast } from 'sonner'

const MEAL_TYPES = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Evening Snack']

function MacroPill({ label, value, target, color }: { label: string; value: number; target?: number; color: string }) {
  return (
    <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${color}`}>
      {label} {value}g{target ? <span className="font-normal opacity-60"> / {target}g</span> : null}
    </span>
  )
}

function CalorieBar({ eaten, target }: { eaten: number; target: number }) {
  const pct = Math.min((eaten / target) * 100, 100)
  const over = eaten > target
  const color = over ? 'bg-red-500' : pct > 85 ? 'bg-amber-400' : 'bg-emerald-400'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-bold text-white">{eaten} <span className="font-normal text-slate-400">kcal eaten</span></span>
        <span className={`font-bold ${over ? 'text-red-400' : 'text-slate-400'}`}>
          {over ? `+${eaten - target} over` : `${target - eaten} left`} · {target} target
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function NutritionClient({
  logId,
  initialMeals,
  calorieTarget,
  caloriesBurned = 0,
  proteinTarget: proteinTargetProp,
  carbsTarget: carbsTargetProp,
  fatsTarget: fatsTargetProp,
  pastLogs = [],
  frequentMeals = [],
  serverDate,
}: {
  logId: string
  initialMeals: MealEntry[]
  calorieTarget: number
  caloriesBurned?: number
  proteinTarget?: number
  carbsTarget?: number
  fatsTarget?: number
  pastLogs?: PastLog[]
  frequentMeals?: FrequentMeal[]
  serverDate?: string
}) {
  const router = useRouter()
  const [meals, setMeals] = useState<MealEntry[]>(initialMeals)

  // Sync to user's local date — server uses UTC which can differ by timezone
  useEffect(() => {
    const localDate = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local tz
    if (serverDate && localDate !== serverDate) {
      const url = new URL(window.location.href)
      url.searchParams.set('date', localDate)
      router.replace(url.toString())
    }
  }, [serverDate, router])
  const [saving, setSaving] = useState(false)

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<MealEntry>>({})

  // Add meal form
  const [showAdd, setShowAdd] = useState(false)
  const [addValues, setAddValues] = useState<Partial<MealEntry>>({ name: 'Breakfast', food: '', calories: 0, protein: 0, carbs: 0, fats: 0 })
  const [estimating, setEstimating] = useState(false)
  const [estimated, setEstimated] = useState(false)

  // Frequent meals quick-add
  const [showFrequent, setShowFrequent] = useState(false)
  const [frequentMealType, setFrequentMealType] = useState('Breakfast')

  // Past days history
  const [showHistory, setShowHistory] = useState(false)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  // AI ideas
  const [showIdeas, setShowIdeas] = useState(false)
  const [ideaType, setIdeaType] = useState('Breakfast')
  const [ideaPrefs, setIdeaPrefs] = useState('')
  const [ideas, setIdeas] = useState<MealIdea[]>([])
  const [generating, setGenerating] = useState(false)

  const totalCalories = meals.reduce((s, m) => s + (m.calories || 0), 0)
  const totalProtein = meals.reduce((s, m) => s + (m.protein || 0), 0)
  const totalCarbs = meals.reduce((s, m) => s + (m.carbs || 0), 0)
  const totalFats = meals.reduce((s, m) => s + (m.fats || 0), 0)

  // Use user-set targets if available, otherwise derive from calorie target
  const proteinTarget = proteinTargetProp ?? Math.round(calorieTarget * 0.30 / 4)
  const carbsTarget = carbsTargetProp ?? Math.round(calorieTarget * 0.45 / 4)
  const fatsTarget = fatsTargetProp ?? Math.round(calorieTarget * 0.25 / 9)

  async function persist(updated: MealEntry[]) {
    setMeals(updated)
    setSaving(true)
    try {
      await saveMealLog(logId, updated)
    } catch {
      toast.error('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(meal: MealEntry) {
    setEditingId(meal.id)
    setEditValues({ ...meal })
  }

  function saveEdit() {
    if (!editingId) return
    const updated = meals.map(m => m.id === editingId ? { ...m, ...editValues } as MealEntry : m)
    persist(updated)
    setEditingId(null)
  }

  function deleteMeal(id: string) {
    persist(meals.filter(m => m.id !== id))
    toast.success('Meal removed')
  }

  async function handleEstimate() {
    if (!addValues.food?.trim()) return
    setEstimating(true)
    try {
      const result = await estimateNutrition(addValues.food)
      if (result) {
        setAddValues(v => ({ ...v, ...result }))
        setEstimated(true)
        toast.success('Nutrition estimated — review and edit below')
      } else {
        toast.error('Could not estimate. Enter values manually.')
      }
    } catch {
      toast.error('Estimation failed. Try again.')
    } finally {
      setEstimating(false)
    }
  }

  function addMeal() {
    if (!addValues.food?.trim()) return
    const newMeal: MealEntry = {
      id: crypto.randomUUID(),
      name: addValues.name || 'Meal',
      food: addValues.food || '',
      calories: Number(addValues.calories) || 0,
      protein: Number(addValues.protein) || 0,
      carbs: Number(addValues.carbs) || 0,
      fats: Number(addValues.fats) || 0,
    }
    persist([...meals, newMeal])
    setAddValues({ name: 'Breakfast', food: '', calories: 0, protein: 0, carbs: 0, fats: 0 })
    setEstimated(false)
    setShowAdd(false)
    toast.success('Meal added')
  }

  function addIdeaToLog(idea: MealIdea) {
    const newMeal: MealEntry = {
      id: crypto.randomUUID(),
      name: ideaType,
      food: idea.food,
      calories: idea.calories,
      protein: idea.protein,
      carbs: idea.carbs,
      fats: idea.fats,
    }
    persist([...meals, newMeal])
    toast.success(`${ideaType} added to log`)
  }

  function logFrequentMeal(meal: FrequentMeal) {
    const newMeal: MealEntry = {
      id: crypto.randomUUID(),
      name: frequentMealType,
      food: meal.food,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
    }
    persist([...meals, newMeal])
    toast.success('Meal added from history')
  }

  async function handleGenerateIdeas() {
    setGenerating(true)
    setIdeas([])
    try {
      const result = await generateMealIdea(ideaType, ideaPrefs)
      setIdeas(result)
    } catch {
      toast.error('Failed to generate ideas.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Hero ──────────────────────────────────────────── */}
      <header className="relative rounded-2xl overflow-hidden bg-slate-900 px-5 py-6 sm:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950" />
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-orange-500/5 blur-2xl" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Today's Nutrition</h1>
            <div className="flex items-center gap-2">
              {saving && <Loader2 size={14} className="text-slate-500 animate-spin" />}
              <Link
                href="/dashboard/account"
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors rounded-full bg-white/5 hover:bg-white/10 px-2.5 py-1"
              >
                <Settings2 size={11} /> Edit goals
              </Link>
            </div>
          </div>
          <CalorieBar eaten={totalCalories} target={calorieTarget} />

          {/* Burned + Net row */}
          {caloriesBurned > 0 && (
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <span className="flex items-center gap-1 text-orange-300 font-semibold">
                <Flame size={12} /> {caloriesBurned} kcal burned
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-semibold text-slate-300">
                Net: <span className={totalCalories - caloriesBurned < 0 ? 'text-blue-400' : 'text-white font-bold'}>
                  {totalCalories - caloriesBurned} kcal
                </span>
              </span>
              <span className="text-[10px] text-slate-500">(eaten − burned)</span>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <MacroPill label="Protein" value={totalProtein} target={proteinTarget} color="bg-blue-500/20 text-blue-300" />
            <MacroPill label="Carbs" value={totalCarbs} target={carbsTarget} color="bg-amber-500/20 text-amber-300" />
            <MacroPill label="Fats" value={totalFats} target={fatsTarget} color="bg-rose-500/20 text-rose-300" />
          </div>
        </div>
      </header>

      {/* ── Meal Log ──────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Utensils size={15} className="text-orange-400" />
            <h2 className="font-bold text-slate-900">Meal Log</h2>
            <span className="text-xs text-slate-400">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <button
            onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Add meal form */}
        {showAdd && (
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 space-y-3 animate-in fade-in duration-150">
            {/* Meal type */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Meal</label>
              <select
                value={addValues.name}
                onChange={e => setAddValues(v => ({ ...v, name: e.target.value }))}
                className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Food description + estimate button */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">What did you eat?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={addValues.food}
                  onChange={e => { setAddValues(v => ({ ...v, food: e.target.value })); setEstimated(false) }}
                  onKeyDown={e => { if (e.key === 'Enter' && !estimated) handleEstimate() }}
                  placeholder="e.g. 2 scrambled eggs with toast and orange juice"
                  className="flex-1 text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  onClick={handleEstimate}
                  disabled={estimating || !addValues.food?.trim()}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-bold bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-lg px-3 py-2 transition-colors"
                >
                  {estimating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  {estimating ? 'Estimating…' : 'Estimate'}
                </button>
              </div>
              {!estimated && (
                <p className="text-[11px] text-slate-400 mt-1">Type what you ate and hit <span className="font-semibold">Estimate</span> — AI will calculate the nutrition for you.</p>
              )}
            </div>

            {/* Nutrition fields — shown after estimation (or always editable) */}
            {(estimated || addValues.calories || addValues.protein || addValues.carbs || addValues.fats) ? (
              <div className="space-y-2 animate-in fade-in duration-200">
                {estimated && (
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check size={11} /> Nutrition estimated — review and adjust if needed
                  </p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Calories</label>
                    <input type="number" min="0" value={addValues.calories || ''}
                      onChange={e => setAddValues(v => ({ ...v, calories: +e.target.value }))}
                      className="w-full text-sm rounded-lg border border-emerald-200 bg-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                  </div>
                  {(['protein', 'carbs', 'fats'] as const).map(macro => (
                    <div key={macro}>
                      <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">{macro} (g)</label>
                      <input type="number" min="0" value={(addValues as any)[macro] || ''}
                        onChange={e => setAddValues(v => ({ ...v, [macro]: +e.target.value }))}
                        className="w-full text-sm rounded-lg border border-emerald-200 bg-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddValues(v => ({ ...v, calories: 0, protein: 0, carbs: 0, fats: 0 }))}
                className="text-[11px] text-slate-400 hover:text-slate-600 underline transition-colors"
              >
                Enter nutrition manually instead
              </button>
            )}

            <div className="flex gap-2">
              <button
                onClick={addMeal}
                disabled={!addValues.food?.trim()}
                className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg px-4 py-2 transition-colors"
              >
                <Check size={13} /> Log Meal
              </button>
              <button
                onClick={() => { setShowAdd(false); setEstimated(false); setAddValues({ name: 'Breakfast', food: '', calories: 0, protein: 0, carbs: 0, fats: 0 }) }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Meal list */}
        <div className="divide-y divide-slate-100">
          {meals.length === 0 && !showAdd && (
            <div className="px-5 py-10 text-center">
              <Utensils size={28} className="mx-auto text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">No meals logged yet today.</p>
              <p className="text-xs text-slate-400 mt-0.5">Add a meal manually or get AI ideas below.</p>
            </div>
          )}

          {meals.map(meal => (
            <div key={meal.id} className="px-5 py-3.5">
              {editingId === meal.id ? (
                /* Edit mode */
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Meal</label>
                      <select value={editValues.name} onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                        className="w-full text-sm rounded-lg border border-slate-200 bg-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900">
                        {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Calories</label>
                      <input type="number" min="0" value={editValues.calories || ''} onChange={e => setEditValues(v => ({ ...v, calories: +e.target.value }))}
                        className="w-full text-sm rounded-lg border border-slate-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                    </div>
                  </div>
                  <input type="text" value={editValues.food} onChange={e => setEditValues(v => ({ ...v, food: e.target.value }))}
                    className="w-full text-sm rounded-lg border border-slate-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  <div className="grid grid-cols-3 gap-2">
                    {(['protein', 'carbs', 'fats'] as const).map(macro => (
                      <div key={macro}>
                        <label className="text-[10px] uppercase text-slate-400 block">{macro} (g)</label>
                        <input type="number" min="0" value={(editValues as any)[macro] || ''}
                          onChange={e => setEditValues(v => ({ ...v, [macro]: +e.target.value }))}
                          className="w-full text-sm rounded-lg border border-slate-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="flex items-center gap-1 text-xs font-bold bg-slate-900 text-white rounded-lg px-3 py-1.5 hover:bg-slate-700 transition-colors">
                      <Check size={12} /> Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-slate-700 px-2">Cancel</button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-orange-500 bg-orange-50 border border-orange-100 rounded-full px-2 py-0.5">{meal.name}</span>
                      <span className="flex items-center gap-0.5 text-xs font-bold text-slate-700">
                        <Flame size={11} className="text-orange-400" /> {meal.calories} kcal
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1 font-medium">{meal.food}</p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      <MacroPill label="P" value={meal.protein} color="bg-blue-50 text-blue-500" />
                      <MacroPill label="C" value={meal.carbs} color="bg-amber-50 text-amber-500" />
                      <MacroPill label="F" value={meal.fats} color="bg-rose-50 text-rose-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(meal)} className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => deleteMeal(meal.id)} className="p-1.5 text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Day total row */}
        {meals.length > 0 && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Day Total</span>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              <span className="text-sm font-black text-slate-900">{totalCalories} kcal</span>
              <div className="flex gap-1.5">
                <MacroPill label="P" value={totalProtein} color="bg-blue-50 text-blue-500" />
                <MacroPill label="C" value={totalCarbs} color="bg-amber-50 text-amber-500" />
                <MacroPill label="F" value={totalFats} color="bg-rose-50 text-rose-500" />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Frequent Meals ─────────────────────────────────── */}
      {frequentMeals.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <button
            onClick={() => setShowFrequent(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-blue-500" />
              <h2 className="font-bold text-slate-900">Your Usual Meals</h2>
              <span className="text-xs text-slate-400">Quick-add from your past</span>
            </div>
            {showFrequent ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>

          {showFrequent && (
            <div className="border-t border-slate-100 p-5 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase text-slate-400">Log as:</span>
                {MEAL_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setFrequentMealType(type)}
                    className={`text-xs font-semibold rounded-full px-3 py-1 border transition-colors ${
                      frequentMealType === type
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {frequentMeals.map((meal, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-800 truncate">{meal.food}</span>
                        <span className="text-[10px] text-slate-400 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shrink-0">{meal.count}×</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-slate-500 flex items-center gap-0.5">
                          <Flame size={10} className="text-orange-400" /> {meal.calories} kcal
                        </span>
                        <MacroPill label="P" value={meal.protein} color="bg-blue-50 text-blue-500" />
                        <MacroPill label="C" value={meal.carbs} color="bg-amber-50 text-amber-500" />
                        <MacroPill label="F" value={meal.fats} color="bg-rose-50 text-rose-500" />
                      </div>
                    </div>
                    <button
                      onClick={() => logFrequentMeal(meal)}
                      className="shrink-0 flex items-center gap-1 text-xs font-bold bg-slate-900 hover:bg-slate-700 text-white rounded-lg px-3 py-1.5 transition-colors"
                    >
                      <Plus size={12} /> Log
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── AI Meal Ideas ──────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <button
          onClick={() => setShowIdeas(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-violet-500" />
            <h2 className="font-bold text-slate-900">Get Meal Ideas</h2>
            <span className="text-xs text-slate-400">Not sure what to eat? Ask AI for suggestions</span>
          </div>
          {showIdeas ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>

        {showIdeas && (
          <div className="border-t border-slate-100 p-5 space-y-4 animate-in fade-in duration-150">
            {/* Meal type selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400">Which meal?</label>
              <div className="flex flex-wrap gap-2">
                {MEAL_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setIdeaType(type)}
                    className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition-colors ${
                      ideaType === type
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400">Any preferences? <span className="normal-case font-normal">(optional)</span></label>
              <input
                type="text"
                value={ideaPrefs}
                onChange={e => setIdeaPrefs(e.target.value)}
                placeholder="e.g. high protein, vegetarian, quick to make, no dairy..."
                className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>

            <button
              onClick={handleGenerateIdeas}
              disabled={generating}
              className="flex items-center gap-2 text-sm font-bold bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl px-5 py-2.5 transition-colors"
            >
              {generating
                ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
                : <><Sparkles size={14} /> Get Ideas</>
              }
            </button>

            {/* Idea cards */}
            {ideas.length > 0 && (
              <div className="space-y-3 pt-1">
                {ideas.map((idea, i) => (
                  <div key={i} className="rounded-xl border border-violet-100 bg-violet-50/40 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{idea.food}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="flex items-center gap-0.5 text-xs font-bold text-slate-600">
                            <Flame size={11} className="text-orange-400" /> {idea.calories} kcal
                          </span>
                          <MacroPill label="P" value={idea.protein} color="bg-blue-50 text-blue-500" />
                          <MacroPill label="C" value={idea.carbs} color="bg-amber-50 text-amber-500" />
                          <MacroPill label="F" value={idea.fats} color="bg-rose-50 text-rose-500" />
                        </div>
                      </div>
                      <button
                        onClick={() => addIdeaToLog(idea)}
                        className="shrink-0 flex items-center gap-1 text-xs font-bold bg-slate-900 hover:bg-slate-700 text-white rounded-lg px-3 py-1.5 transition-colors"
                      >
                        <Plus size={12} /> Log it
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Past Days History ───────────────────────────────── */}
      {pastLogs.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <button
            onClick={() => setShowHistory(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <History size={15} className="text-slate-400" />
              <h2 className="font-bold text-slate-900">Past Days</h2>
              <span className="text-xs text-slate-400">{pastLogs.length} day{pastLogs.length !== 1 ? 's' : ''} logged</span>
            </div>
            {showHistory ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>

          {showHistory && (
            <div className="border-t border-slate-100 divide-y divide-slate-100 animate-in fade-in duration-150">
              {pastLogs.map(log => {
                const dayMeals = log.meals as MealEntry[]
                const dayTotal = dayMeals.reduce((s, m) => s + (m.calories || 0), 0)
                const dayProtein = dayMeals.reduce((s, m) => s + (m.protein || 0), 0)
                const dayCarbs = dayMeals.reduce((s, m) => s + (m.carbs || 0), 0)
                const dayFats = dayMeals.reduce((s, m) => s + (m.fats || 0), 0)
                const isExpanded = expandedDay === log.id
                const dateLabel = new Date(log.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

                return (
                  <div key={log.id}>
                    <button
                      onClick={() => setExpandedDay(isExpanded ? null : log.id)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
                        <span className="text-sm font-semibold text-slate-700">{dateLabel}</span>
                        <span className="text-xs text-slate-400">{dayMeals.length} meal{dayMeals.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex gap-1.5">
                          <MacroPill label="P" value={dayProtein} color="bg-blue-50 text-blue-500" />
                          <MacroPill label="C" value={dayCarbs} color="bg-amber-50 text-amber-500" />
                          <MacroPill label="F" value={dayFats} color="bg-rose-50 text-rose-500" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">{dayTotal} kcal</span>
                      </div>
                    </button>

                    {isExpanded && dayMeals.length > 0 && (
                      <div className="bg-slate-50/60 divide-y divide-slate-100 border-t border-slate-100">
                        {dayMeals.map((meal, i) => (
                          <div key={i} className="flex items-start justify-between gap-3 px-5 py-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-orange-500 bg-orange-50 border border-orange-100 rounded-full px-2 py-0.5">{meal.name}</span>
                                <span className="text-xs font-bold text-slate-600 flex items-center gap-0.5">
                                  <Flame size={10} className="text-orange-400" /> {meal.calories} kcal
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 mt-1">{meal.food}</p>
                              <div className="flex gap-1.5 mt-1 flex-wrap">
                                <MacroPill label="P" value={meal.protein} color="bg-blue-50 text-blue-500" />
                                <MacroPill label="C" value={meal.carbs} color="bg-amber-50 text-amber-500" />
                                <MacroPill label="F" value={meal.fats} color="bg-rose-50 text-rose-500" />
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const newMeal: MealEntry = { ...meal, id: crypto.randomUUID() }
                                persist([...meals, newMeal])
                                toast.success('Meal added to today')
                              }}
                              className="shrink-0 text-xs font-semibold text-slate-400 hover:text-slate-700 border border-slate-200 hover:border-slate-400 rounded-lg px-2.5 py-1.5 transition-colors whitespace-nowrap"
                            >
                              + Today
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
