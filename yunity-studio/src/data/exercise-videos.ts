/**
 * Maps exercise names (lowercase) to YouTube video IDs.
 * If a video ID is wrong, YouTube shows "unavailable" inside the modal
 * and the "Search on YouTube" fallback link is always visible below.
 */
export const EXERCISE_VIDEOS: Record<string, string> = {
  // ── Chest ────────────────────────────────────────────────
  'bench press':            'vcBig73ojpE',
  'incline bench press':    'DbFgADa2PL8',
  'decline bench press':    'LfyQTbFDmYA',
  'dumbbell chest press':   'QsYre__-aro',
  'incline dumbbell press': '8iPEnn-ltC8',
  'dumbbell fly':           '4-muFpEzq5o',
  'incline dumbbell fly':   'eozdVDA78K0',
  'cable fly':              'Iwe6AmxVf7o',
  'cable crossover':        'taI4XduLpTk',
  'pec deck':               'Z57CtFmRMxA',
  'push-up':                'IODxDxX7oi4',
  'pushup':                 'IODxDxX7oi4',
  'chest dip':              'wjUmnZH528Y',
  'dip':                    'wjUmnZH528Y',
  'landmine press':         'hPV7hTBOXQo',

  // ── Back ─────────────────────────────────────────────────
  'deadlift':               'op9kVnSso6Q',
  'romanian deadlift':      'JCXUYuzwNrM',
  'rdl':                    'JCXUYuzwNrM',
  'barbell row':            'G8l_8chR5BE',
  'bent over row':          'G8l_8chR5BE',
  'pendlay row':            'MfKSSHG0Usk',
  't-bar row':              'j3Ymr7rnMGI',
  'pull-up':                'eGo4IYlbE5g',
  'pullup':                 'eGo4IYlbE5g',
  'chin-up':                'eGo4IYlbE5g',
  'chinup':                 'eGo4IYlbE5g',
  'lat pulldown':           'CAwf7n6Luuc',
  'seated cable row':       'GZbfZ033f74',
  'single-arm dumbbell row': 'pYcpY20QaE8',
  'one-arm dumbbell row':   'pYcpY20QaE8',
  'dumbbell row':           'pYcpY20QaE8',
  'chest-supported row':    'roCP2ef8wvU',
  'face pull':              'V8dZ3lL7Xtg',
  'straight-arm pulldown':  'kiuVA0gs3EI',
  'hyperextension':         'ph3pddpKzzw',
  'back extension':         'ph3pddpKzzw',
  'good morning':           'YA-h3n9L4YU',

  // ── Legs ─────────────────────────────────────────────────
  'squat':                  'ultKZa3bh1I',
  'back squat':             'ultKZa3bh1I',
  'barbell squat':          'ultKZa3bh1I',
  'front squat':            'uYumuL_G_V0',
  'hack squat':             'EdtPAT0oCgg',
  'leg press':              'IZxyjW7MPJQ',
  'bulgarian split squat':  'CE7n7ezRJcE',
  'split squat':            'CE7n7ezRJcE',
  'lunge':                  'QOVaHwm-Q6U',
  'walking lunge':          'L8fvypPrzzs',
  'step-up':                'dQqApCGd5Ss',
  'hip thrust':             'xDmFkJxPzeM',
  'glute bridge':           'wPM8icPu6H8',
  'sumo deadlift':          'iFgpBFm9EBk',
  'leg extension':          'YyvSfVjQeL0',
  'leg curl':               'Orxoeast54Q',
  'hamstring curl':         'Orxoeast54Q',
  'seated leg curl':        'ELOCsoDSmrg',
  'standing calf raise':    'gwLzBJYoWlA',
  'calf raise':             'gwLzBJYoWlA',
  'seated calf raise':      'JbyjNymZOt0',
  'goblet squat':           'MxsFDhcyFyE',
  'leg press calf raise':   'wDEy4P0Qdas',

  // ── Shoulders ────────────────────────────────────────────
  'overhead press':         '2yjwXTZbDtY',
  'ohp':                    '2yjwXTZbDtY',
  'military press':         '2yjwXTZbDtY',
  'barbell overhead press': '2yjwXTZbDtY',
  'seated dumbbell press':  'qEwKCR5JCog',
  'dumbbell shoulder press':'qEwKCR5JCog',
  'arnold press':           '6Z15_WdXmVw',
  'lateral raise':          'OuG1smZTsQQ',
  'dumbbell lateral raise': 'OuG1smZTsQQ',
  'cable lateral raise':    'PPFwDiB5REo',
  'front raise':            'gkUPqaLMFBo',
  'dumbbell front raise':   'gkUPqaLMFBo',
  'rear delt fly':          'EA7u4Q_8HQ0',
  'reverse fly':            'EA7u4Q_8HQ0',
  'rear delt raise':        'EA7u4Q_8HQ0',
  'reverse pec deck':       'Uh6yBBZUoO8',
  'upright row':            'VG68LvRuuRg',
  'shrug':                  'cJRVVxmytaM',
  'barbell shrug':          'cJRVVxmytaM',
  'dumbbell shrug':         'cJRVVxmytaM',
  'push press':             'X6-DMh-t4nQ',

  // ── Biceps ───────────────────────────────────────────────
  'barbell curl':           'ykJmrZ5v0Oo',
  'ez bar curl':            'ykJmrZ5v0Oo',
  'dumbbell curl':          'sAq_ocpRh_I',
  'bicep curl':             'sAq_ocpRh_I',
  'hammer curl':            'zC3nLlEvin4',
  'preacher curl':          'fIWP-FRFNU0',
  'cable curl':             '0zMPcTNv_QI',
  'incline dumbbell curl':  'soxrZlIl35U',
  'concentration curl':     'Jvj2wV0vOYU',
  'spider curl':            'MFSqmQVTFOE',
  'reverse curl':           'nFqFjm6OQPE',
  'zottman curl':           'ZrFZItMEKBY',
  '21s':                    'K8SNXUnYUhg',

  // ── Triceps ──────────────────────────────────────────────
  'tricep pushdown':        '2-LAMcpzODU',
  'triceps pushdown':       '2-LAMcpzODU',
  'cable pushdown':         '2-LAMcpzODU',
  'overhead tricep extension': 'YbX7Wd8jQ-Q',
  'skull crusher':          'NIxgwFVNWaE',
  'lying tricep extension': 'NIxgwFVNWaE',
  'close-grip bench press': 'nEF0bv2FW7s',
  'tricep dip':             'wjUmnZH528Y',
  'cable overhead extension': 'YbX7Wd8jQ-Q',
  'cable overhead tricep extension': 'YbX7Wd8jQ-Q',
  'diamond push-up':        'J0DnG1_S92I',
  'kickback':               'PpvSEFgNIqk',
  'tricep kickback':        'PpvSEFgNIqk',
  'tate press':             'G0e2q7bMjGw',

  // ── Core ─────────────────────────────────────────────────
  'plank':                  'kSBBMGFpBAk',
  'side plank':             'K2AGJZ3nKwQ',
  'crunch':                 'Xyd_fa5zoEU',
  'bicycle crunch':         '9FGilxCbdz8',
  'leg raise':              'JB2oyawG9KI',
  'lying leg raise':        'JB2oyawG9KI',
  'hanging knee raise':     'Pr1ieGZ5atk',
  'hanging leg raise':      'Pr1ieGZ5atk',
  'ab rollout':             'T7uJWFRFkGw',
  'ab wheel rollout':       'T7uJWFRFkGw',
  'cable crunch':           'Pk5NGwUEVQw',
  'russian twist':          '9uIBtjSNqcE',
  'dead bug':               'g_BYB0R-4Ws',
  'v-up':                   'iP2fjBZDmlo',
  'mountain climber':       'nmwgirgXLYM',
  'mountain climbers':      'nmwgirgXLYM',
  'dragon flag':            'njVCDrEDTcM',
  'pallof press':           'AYEZOfvFEo4',

  // ── Cardio ───────────────────────────────────────────────
  'treadmill run':          'O-cGZiaSbls',
  'treadmill':              'O-cGZiaSbls',
  'stationary bike':        '5vsgn5bFpz4',
  'cycling':                '5vsgn5bFpz4',
  'rowing machine':         'H0r1AMBUAM0',
  'elliptical':             'rUfHRoZxzCY',
  'stair climber':          'h0BqrPbHTzM',
  'jump rope':              'u3zgHI8QnqE',
  'skipping':               'u3zgHI8QnqE',
  'burpee':                 'TU8QYVW0gDU',
  'burpees':                'TU8QYVW0gDU',
  'box jump':               'hxldG9BzmGg',
  'battle rope':            'QPC8Ov5tkGk',
  'battle ropes':           'QPC8Ov5tkGk',
  'sled push':              'B9RECIRnFhk',
  'farmer carry':           'Fkzk_RqlYig',
  'farmer walk':            'Fkzk_RqlYig',
}

export function getExerciseVideoId(exerciseName: string): string | null {
  const name = exerciseName.toLowerCase().trim()

  // Exact match
  if (EXERCISE_VIDEOS[name]) return EXERCISE_VIDEOS[name]

  // Any key contained in the exercise name (e.g. "barbell bench press" contains "bench press")
  // Sort by key length descending so longer (more specific) keys match first
  const sortedKeys = Object.keys(EXERCISE_VIDEOS).sort((a, b) => b.length - a.length)
  for (const key of sortedKeys) {
    if (name.includes(key)) return EXERCISE_VIDEOS[key]
  }

  // Exercise name contained in a key
  for (const key of sortedKeys) {
    if (key.includes(name)) return EXERCISE_VIDEOS[key]
  }

  return null
}
