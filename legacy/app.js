/* ═══════════════════════════════════════════════════════
   FITNESS TRACKER v3 — app.js
   All data stored in localStorage. No backend required.
   ═══════════════════════════════════════════════════════ */

// ─── STORAGE KEYS ────────────────────────────────────────
const K = {
  PROFILE:       'ft3_profile',
  CUSTOM_SPLIT:  'ft3_split',
  DAILY_LOGS:    'ft3_logs',
  WEIGHT_HIST:   'ft3_weights',
  TRACKER:       'ft3_tracker',
  MEAL_SEED:     'ft3_seed',
  STREAK:        'ft3_streak',
  LAST_WI:       'ft3_last_weighin',
};

// ─── DAYS ────────────────────────────────────────────────
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DAY_SHORT = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

// ─── GYM SPLITS DATABASE ────────────────────────────────
const GYM_SPLITS = {
  'Push Day': {
    tag:'🏋️ Chest · Shoulders · Triceps',
    exs:['Barbell Bench Press 4×8','Incline DB Press 3×10','Cable Flyes 3×12','Overhead Press 3×10','Tricep Rope Pushdown 3×15','Lateral Raises 3×15']
  },
  'Pull Day': {
    tag:'💪 Back · Biceps · Rear Delts',
    exs:['Lat Pulldowns 4×10','Bent-over Row 4×8','Seated Cable Row 3×12','Face Pulls 3×15','Barbell Curl 3×12','Hammer Curls 3×12']
  },
  'Leg Day': {
    tag:'🦵 Quads · Hamstrings · Glutes',
    exs:['Barbell Squat 4×8','Romanian Deadlift 3×10','Leg Press 3×12','Leg Curl 3×12','Walking Lunges 3×12','Calf Raises 4×20']
  },
  'Upper Body': {
    tag:'🔝 Push + Pull Combined',
    exs:['DB Bench Press 3×10','Bent-over Row 3×10','Overhead Press 3×10','Lat Pulldown 3×10','Lateral Raises 3×15','Bicep Curls 3×12']
  },
  'Lower Body': {
    tag:'⬇️ Squat + Hinge Pattern',
    exs:['Goblet Squat 4×10','Romanian Deadlift 3×10','Leg Press 3×12','Leg Curl 3×12','Bulgarian Split Squat 3×10','Calf Raises 3×20']
  },
  'Full Body': {
    tag:'⚡ Compound Full Body',
    exs:['Deadlift 3×5','Bench Press 3×8','Pull-ups 3×8','Overhead Press 3×10','Lunges 3×10','Plank 3×45s']
  },
  'Chest & Triceps': {
    tag:'💪 Chest Focus + Triceps',
    exs:['Flat Bench Press 4×8','Incline Flyes 3×12','Cable Crossover 3×15','Skull Crushers 3×10','Tricep Dips 3×12','Close-grip Bench 3×10']
  },
  'Back & Biceps': {
    tag:'🔙 Back Width + Thickness',
    exs:['Pull-ups 4×8','DB Row 4×10','Cable Pullover 3×12','Preacher Curl 3×12','Incline DB Curl 3×12','Reverse Curl 3×12']
  },
  'Shoulders & Arms': {
    tag:'💥 Delts · Bis · Tris',
    exs:['Overhead Press 4×8','Lateral Raises 4×12','Rear Delt Flyes 3×15','Barbell Curl 3×10','Tricep Pushdown 3×12','Face Pulls 3×15']
  },
  'Core & Abs': {
    tag:'🎯 Core Strength & Stability',
    exs:['Hanging Leg Raises 4×15','Cable Crunch 3×20','Ab Wheel Rollout 3×10','Russian Twists 3×30','Plank 3×60s','Side Plank 3×40s each']
  },
};

// ─── CARDIO OPTIONS ─────────────────────────────────────
const CARDIO_TYPES = ['Steps Goal','HIIT Sprints','LISS — Steady Jog','Cycling','Jump Rope','Swimming','Elliptical'];

const CARDIO_DETAILS = {
  'Steps Goal':       { icon:'🚶', desc:(g)=>`Walk/Run ${(g||10000).toLocaleString()} steps` },
  'HIIT Sprints':     { icon:'🏃', desc:()=>'10×(30s sprint + 60s jog). Total ~20 min.' },
  'LISS — Steady Jog':{ icon:'🏃', desc:(g)=>`Steady jog/walk for ${g||45} min at 65–70% max HR.` },
  'Cycling':          { icon:'🚴', desc:(g)=>`${g||45} min cycling at moderate pace.` },
  'Jump Rope':        { icon:'🪃', desc:(g)=>`${g||5} rounds of 3 min jump rope + 1 min rest.` },
  'Swimming':         { icon:'🏊', desc:(g)=>`${g||30} min of continuous swimming laps.` },
  'Elliptical':       { icon:'🔄', desc:(g)=>`${g||40} min on elliptical, resistance level 7+.` },
};

// ─── INDIAN MEAL DATABASE ────────────────────────────────
const MEALS = {
  veg: {
    breakfast: [
      { name: 'Poha with Peanuts', desc: 'Flattened rice sautéed with mustard seeds, onion, peanuts, and lemon.', ratio: 0.25 },
      { name: 'Vegetable Upma', desc: 'Semolina cooked with mustard seeds, curry leaves, and mixed seasonal vegetables.', ratio: 0.25 },
      { name: 'Moong Dal Chilla', desc: 'Protein-rich green gram batter crepes filled with grated paneer and herbs.', ratio: 0.25 },
      { name: 'Oats with Fruits & Nuts', desc: 'Steel-cut oats with cinnamon, fresh apple, almonds, and walnuts.', ratio: 0.25 },
      { name: 'Idli with Sambar', desc: 'Steamed rice cakes served with a fiber-rich dal and vegetable stew.', ratio: 0.25 }
    ],
    lunch: [
      { name: 'Rajma Chawal', desc: 'Red kidney bean curry cooked in onion-tomato gravy served with brown rice.', ratio: 0.35 },
      { name: 'Paneer Butter Masala & Roti', desc: 'Cottage cheese in a tomato gravy with 2 whole wheat rotis and salad.', ratio: 0.35 },
      { name: 'Chana Masala with Jeera Rice', desc: 'Chickpea curry with cumin-tempered brown rice and a side of curd.', ratio: 0.35 },
      { name: 'Mixed Vegetable Khichdi', desc: 'Brown rice and lentil pot-dish with seasonal veggies, turmeric, and ghee.', ratio: 0.35 },
      { name: 'Palak Paneer with Brown Rice', desc: 'Spiced spinach curry with paneer cubes and a serving of brown rice.', ratio: 0.35 }
    ],
    snack: [
      { name: 'Roasted Makhana', desc: 'Foxnuts roasted with rock salt, pepper, and a touch of olive oil.', ratio: 0.10 },
      { name: 'Sprouts Salad', desc: 'Steamed sprouts with finely chopped onion, tomato, green chilli, and lemon.', ratio: 0.10 },
      { name: 'Fruit Chaat', desc: 'Seasonal fresh fruits dusted with black salt and chaat masala.', ratio: 0.10 },
      { name: 'Roasted Chana', desc: 'Crunchy roasted chickpeas with a squeeze of lime and spices.', ratio: 0.10 }
    ],
    dinner: [
      { name: 'Dal Tadka with Phulka', desc: 'Yellow lentils tempered with garlic and cumin served with 2 phulkas.', ratio: 0.30 },
      { name: 'Lauki Sabzi with Roti', desc: 'Bottle gourd curry with mild spices served with 2 wheat rotis.', ratio: 0.30 },
      { name: 'Dalia Porridge', desc: 'Savory broken wheat porridge cooked with peas and carrots.', ratio: 0.30 },
      { name: 'Vegetable Soup & Salad', desc: 'Hearty mix-vegetable clear soup with a fresh raw garden salad.', ratio: 0.30 }
    ]
  },
  eggitarian: {
    breakfast: [
      { name: 'Masala Omelette', desc: '3-egg omelette with onion, tomato, green chilli, and fresh coriander.', ratio: 0.25 },
      { name: 'Egg Bhurji', desc: 'Spiced Indian-style scrambled eggs with toasted multigrain bread.', ratio: 0.25 },
      { name: 'Boiled Eggs & Toast', desc: '2 hard-boiled eggs with buttered whole wheat toast and fruit.', ratio: 0.25 },
      { name: 'Egg Paratha', desc: 'Stuffed paratha with egg filling served with low-fat yogurt.', ratio: 0.25 }
    ],
    lunch: [
      { name: 'Egg Curry & Brown Rice', desc: 'Boiled eggs in a tomato-onion masala served with brown rice and salad.', ratio: 0.35 },
      { name: 'Anda Fried Rice', desc: 'Brown rice stir-fried with eggs, soy sauce, and diced crunchy vegetables.', ratio: 0.35 },
      { name: 'Egg Bhurji with Dal & Roti', desc: 'Scrambled eggs served alongside moong dal and 2 whole wheat rotis.', ratio: 0.35 },
      { name: 'Chickpea & Egg Salad', desc: 'Boiled chickpeas tossed with chopped egg, onion, and vinaigrette.', ratio: 0.35 }
    ],
    snack: [
      { name: 'Sprouts & Boiled Egg', desc: 'High-protein bowl of mixed sprouts and one chopped hard-boiled egg.', ratio: 0.10 },
      { name: 'Egg Whites Chaat', desc: 'Chopped boiled egg whites tossed with onion and chaat masala.', ratio: 0.10 },
      { name: 'Roasted Chana & Egg', desc: 'A handful of roasted chana and 1 hard-boiled egg.', ratio: 0.10 }
    ],
    dinner: [
      { name: 'Egg White Soup', desc: 'Clear chicken-style broth with egg white ribbons and seasonal herbs.', ratio: 0.30 },
      { name: 'Egg Masala with Phulka', desc: 'Simple egg masala curry served with 2 light phulkas.', ratio: 0.30 },
      { name: 'Vegetable Khichdi & Egg', desc: 'Comforting lentil-rice porridge topped with a boiled egg.', ratio: 0.30 }
    ]
  },
  nonveg: {
    breakfast:[
      { name:'Chicken Keema Paratha',                   desc:'Whole wheat paratha stuffed with spiced minced chicken keema, served with mint chutney and curd.', ratio:0.25 },
      { name:'Egg Bhurji with Chicken Sausage & Roti',  desc:'Spiced scrambled eggs with Indian chicken sausage, served with 2 whole wheat rotis.', ratio:0.25 },
      { name:'Chicken Poha',                            desc:'Flattened rice with shredded boiled chicken, mustard seeds, curry leaves, green chilli, and peanuts.', ratio:0.25 },
      { name:'Masala Omelette with Toast',              desc:'3-egg masala omelette with onion, tomato, green chilli and multigrain toast.', ratio:0.25 },
    ],
    lunch:[
      { name:'Chicken Curry with Brown Rice',           desc:'Homestyle dhaba-style chicken curry in a tomato-onion gravy, served with steamed brown basmati rice.', ratio:0.35 },
      { name:'Mutton Keema with Roti',                  desc:'Spiced minced mutton cooked with onion, tomato, green chilli, and garam masala — served with 2 rotis.', ratio:0.35 },
      { name:'Grilled Chicken with Dal & Roti',         desc:'Spiced grilled chicken breast with toor dal and 2 whole wheat rotis.', ratio:0.35 },
      { name:'Fish Curry with Brown Rice',              desc:'Light coastal-style fish curry cooked with coconut, tomato, and tamarind — served with brown rice.', ratio:0.35 },
      { name:'Chicken Biryani (Healthy)',               desc:'Brown basmati biryani cooked with grilled chicken, yogurt marinade, and aromatic spices — low-oil.', ratio:0.35 },
    ],
    snack:[
      { name:'Chicken Tikka Bites',                    desc:'Grilled marinated chicken tikka pieces with mint chutney — high protein gym snack.', ratio:0.10 },
      { name:'Boiled Egg & Roasted Chana',             desc:'2 boiled eggs with a small portion of roasted chana and a squeeze of lime.', ratio:0.10 },
      { name:'Fish Tikka (Grilled)',                    desc:'Grilled marinated fish tikka pieces with onion rings and lime — high protein low fat.', ratio:0.10 },
    ],
    dinner:[
      { name:'Chicken Stew with Phulka',                desc:'Light Kerala-style chicken stew with coconut milk, potato, carrots, and 2 thin phulkas.', ratio:0.30 },
      { name:'Grilled Fish with Dal Soup',              desc:'Lightly spiced grilled fish fillet with a bowl of clear moong dal soup and salad.', ratio:0.30 },
      { name:'Chicken Soup with Multigrain Toast',      desc:'Clear protein-rich chicken soup with ginger, garlic, herbs, and 1 multigrain toast.', ratio:0.30 },
      { name:'Egg Curry with Roti',                     desc:'Simple egg curry in thin tomato gravy with 2 phulkas and fresh curd.', ratio:0.30 },
    ],
  },
};


// ─── CHECKLIST ITEMS ────────────────────────────────────
const CHECKLIST = [
  { id:'breakfast', icon:'🍳', label:'Eat Breakfast' },
  { id:'lunch',     icon:'🥗', label:'Eat Lunch' },
  { id:'snack',     icon:'🍎', label:'Eat Snack' },
  { id:'dinner',    icon:'🍽️', label:'Eat Dinner' },
  { id:'water',     icon:'💧', label:'Drink 8 Glasses of Water' },
  { id:'sleep',     icon:'🛌', label:'Get 7–8 Hours of Sleep' },
];

// ─── STATE ──────────────────────────────────────────────
const S = {
  profile:     null,
  customSplit: null,
  dailyLogs:   {},
  weightHist:  [],
  tracker:     { date:'', water:0, checkedIds:[] },
  mealSeed:    0,
  streak:      0,
  lastWeighIn: null,
  calMonth:    new Date(),
};

// ─── HELPERS ────────────────────────────────────────────
function todayStr() { return new Date().toISOString().slice(0,10); }
function dateStr(d)  { return d.toISOString().slice(0,10); }
function save(k,v)   { try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
function load(k)     { try{ return JSON.parse(localStorage.getItem(k)); }catch{ return null; } }

function seededRand(seed) {
  let s = Math.abs(seed) || 1;
  return () => { s=(s*16807)%2147483647; return (s-1)/2147483646; };
}
function pick(arr, rand) { return arr[Math.floor(rand()*arr.length)]; }

function showToast(msg, dur=2500) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.remove('hidden');
  clearTimeout(t._t);
  t._t=setTimeout(()=>t.classList.add('hidden'),dur);
}

function dayOfWeek(dateString) {
  // Returns DAYS index (0=Monday … 6=Sunday)
  const d = new Date(dateString+'T12:00:00');
  return (d.getDay()+6)%7;
}

function formatDate(ds, opts) {
  return new Date(ds+'T12:00:00').toLocaleDateString('en-IN', opts);
}

function todayDayIndex() { return (new Date().getDay()+6)%7; }

// ─── BMI & CALORIES ─────────────────────────────────────
function calcBMI(w,h)   { const hm=h/100; return w/(hm*hm); }
function bmiCat(bmi) {
  if(bmi<18.5) return 'Underweight';
  if(bmi<25)   return 'Normal Weight';
  if(bmi<30)   return 'Overweight';
  return 'Obese';
}
function calcCals(p) {
  let bmr;
  if(p.gender==='male')   bmr=10*p.weight+6.25*p.height-5*p.age+5;
  else if(p.gender==='female') bmr=10*p.weight+6.25*p.height-5*p.age-161;
  else                    bmr=10*p.weight+6.25*p.height-5*p.age-78;
  const maint=bmr*1.55;
  if(p.goal==='lose')   return Math.round(maint-500);
  if(p.goal==='gain')   return Math.round(maint+400);
  return Math.round(maint);
}

// ─── INIT ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);

function init() {
  loadState();
  setupPills();
  setupForm();
  setupHeaderBtns();
  setupNavTabs();
  setupWaterBtns();
  setupWeightModal();
  setupLogModal();
  setupSplitModal();

  if (!S.profile) {
    show('onboarding-overlay');
    hide('app');
  } else {
    hide('onboarding-overlay');
    show('app');
    checkWeeklyWeighIn();
    renderAll();
  }
}

function show(id) { document.getElementById(id).classList.remove('hidden'); }
function hide(id) { document.getElementById(id).classList.add('hidden'); }

// ─── LOAD STATE ─────────────────────────────────────────
function loadState() {
  S.profile      = load(K.PROFILE);
  S.customSplit  = load(K.CUSTOM_SPLIT);
  S.dailyLogs    = load(K.DAILY_LOGS)   || {};
  S.weightHist   = load(K.WEIGHT_HIST)  || [];
  S.streak       = load(K.STREAK)       || 0;
  S.lastWeighIn  = load(K.LAST_WI)      || null;
  S.mealSeed     = load(K.MEAL_SEED)    || 0;

  const td = todayStr();
  const saved = load(K.TRACKER);
  if (saved && saved.date===td) {
    S.tracker = saved;
  } else {
    if (saved && saved.date!==td) archiveDay(saved);
    S.tracker = { date:td, water:0, checkedIds:[] };
    S.mealSeed = Date.now();
    save(K.MEAL_SEED, S.mealSeed);
    save(K.TRACKER, S.tracker);
  }

  if (!S.customSplit && S.profile) buildDefaultSplit();
}

// ─── DEFAULT SPLIT ──────────────────────────────────────
function buildDefaultSplit() {
  const pref = S.profile?.routine || 'gym';
  S.customSplit = {};
  DAYS.forEach((d,i) => {
    if (i===2||i===6) { // Wed, Sun = rest
      S.customSplit[d] = { active:false, type:'rest' };
    } else if (pref==='cardio') {
      S.customSplit[d] = { active:true, type:'cardio', cardioType:'Steps Goal', cardioGoal:10000 };
    } else if (pref==='gym') {
      const splits = ['Push Day','Pull Day','Leg Day','Upper Body','Lower Body'];
      const idx = [0,1,3,2,4];
      const si = [0,1,3,4,5].indexOf(i);
      S.customSplit[d] = { active:true, type:'gym', split: splits[si>=0?si:0] };
    } else { // both
      const mixed = ['Push Day','HIIT Sprints','Pull Day','Steps Goal','Leg Day'];
      const mi = [0,1,3,4,5].indexOf(i);
      if(mi%2===0)
        S.customSplit[d]={ active:true, type:'gym', split: ['Push Day','Pull Day','Leg Day','Full Body','Upper Body'][mi>=0?Math.floor(mi/1):0] };
      else
        S.customSplit[d]={ active:true, type:'cardio', cardioType:'HIIT Sprints', cardioGoal:0 };
    }
  });
  save(K.CUSTOM_SPLIT, S.customSplit);
}

// ─── ARCHIVE DAY ────────────────────────────────────────
function archiveDay(tracker) {
  const total = CHECKLIST.length + 1;
  const done  = tracker.checkedIds.length;
  const dayIdx = dayOfWeek(tracker.date);
  const splitDay = S.customSplit?.[DAYS[dayIdx]];
  const isRest = !splitDay || !splitDay.active || splitDay.type==='rest';
  const success = isRest ? (done >= Math.ceil(CHECKLIST.length * 0.7)) : (done >= Math.ceil(total * 0.75));

  if (!S.dailyLogs[tracker.date]) {
    S.dailyLogs[tracker.date] = {
      date:tracker.date, done, total, water:tracker.water,
      success, checkedIds:tracker.checkedIds, notes:'', status: success?'logged':'absent'
    };
    save(K.DAILY_LOGS, S.dailyLogs);
    recalcStreak();
  }
}

// ─── STREAK ─────────────────────────────────────────────
function recalcStreak() {
  const logs = Object.values(S.dailyLogs).sort((a,b)=>b.date.localeCompare(a.date));
  if (!logs.length) { S.streak=0; save(K.STREAK,0); return; }
  const td = todayStr();
  const gap = Math.round((new Date(td)-new Date(logs[0].date))/86400000);
  if (gap>1) { S.streak=0; save(K.STREAK,0); return; }
  let s=0;
  for (const l of logs) { if(l.success) s++; else break; }
  S.streak=s; save(K.STREAK,s);
}

// ─── WEEKLY WEIGH-IN CHECK ──────────────────────────────
function checkWeeklyWeighIn() {
  if (!S.lastWeighIn) { showWeightModal(); return; }
  const daysSince = Math.round((new Date(todayStr())-new Date(S.lastWeighIn))/86400000);
  if (daysSince >= 7) showWeightModal();
}

function showWeightModal() {
  show('weight-modal');
  document.getElementById('wi-weight').value = '';
  document.getElementById('wi-weight').focus();
}

// ─── PILLS SETUP ────────────────────────────────────────
function setupPills() {
  [['goal-pills','g-goal'],['diet-pills','g-diet'],['routine-pills','g-routine']].forEach(([cid,hid])=>{
    const c=document.getElementById(cid), h=document.getElementById(hid);
    c.querySelectorAll('.pill').forEach(p=>{
      p.addEventListener('click',()=>{
        c.querySelectorAll('.pill').forEach(x=>x.classList.remove('active'));
        p.classList.add('active'); h.value=p.dataset.v;
      });
    });
  });
}

function setPillActive(cid, hid, val) {
  const c=document.getElementById(cid), h=document.getElementById(hid);
  if(!c||!h) return;
  c.querySelectorAll('.pill').forEach(p=>p.classList.toggle('active',p.dataset.v===val));
  h.value=val;
}

// ─── ONBOARDING FORM ────────────────────────────────────
function setupForm() {
  document.getElementById('onboarding-form').addEventListener('submit', e => {
    e.preventDefault();
    const age=parseInt(document.getElementById('g-age').value);
    const height=parseInt(document.getElementById('g-height').value);
    const weight=parseFloat(document.getElementById('g-weight').value);
    const errEl=document.getElementById('form-err');
    if (!age||!height||!weight||age<10||height<100||weight<30) {
      errEl.classList.remove('hidden'); return;
    }
    errEl.classList.add('hidden');
    S.profile = {
      gender:document.getElementById('g-gender').value,
      age, height, weight,
      goal:document.getElementById('g-goal').value,
      diet:document.getElementById('g-diet').value,
      routine:document.getElementById('g-routine').value,
    };
    save(K.PROFILE, S.profile);
    if (!S.customSplit) buildDefaultSplit();
    S.mealSeed=Date.now(); save(K.MEAL_SEED, S.mealSeed);
    hide('onboarding-overlay'); show('app');
    checkWeeklyWeighIn();
    renderAll();
    showToast('Profile saved! Your plan is ready 🚀');
  });
}

// ─── HEADER BUTTONS ─────────────────────────────────────
function setupHeaderBtns() {
  document.getElementById('btn-edit').addEventListener('click',()=>{
    if(!S.profile) return;
    const p=S.profile;
    document.getElementById('g-gender').value=p.gender;
    document.getElementById('g-age').value=p.age;
    document.getElementById('g-height').value=p.height;
    document.getElementById('g-weight').value=p.weight;
    setPillActive('goal-pills','g-goal',p.goal);
    setPillActive('diet-pills','g-diet',p.diet);
    setPillActive('routine-pills','g-routine',p.routine);
    show('onboarding-overlay');
  });
  document.getElementById('btn-reset').addEventListener('click',()=>{
    if(confirm('Delete ALL data permanently?')) {
      Object.values(K).forEach(k=>localStorage.removeItem(k));
      location.reload();
    }
  });
}

// ─── NAV TABS ────────────────────────────────────────────
function setupNavTabs() {
  const tabs=[...document.querySelectorAll('.nav-tab')];
  const bnav=[...document.querySelectorAll('.bnav-btn')];
  const panes=[...document.querySelectorAll('.tab-pane')];

  function switchTab(name) {
    tabs.forEach(t=>t.classList.toggle('active',t.dataset.tab===name));
    bnav.forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
    panes.forEach(p=>{
      const active=p.id===`tab-${name}`;
      p.classList.toggle('active',active);
      if(active && name==='calendar') renderCalendar();
      if(active && name==='split')    renderSplitPage();
      if(active && name==='progress') renderProgress();
    });
  }
  tabs.forEach(t=>t.addEventListener('click',()=>switchTab(t.dataset.tab)));
  bnav.forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
}

// ─── RENDER ALL ──────────────────────────────────────────
function renderAll() {
  renderHeader();
  renderMetrics();
  renderTodayWorkout();
  renderMeals();
  renderChecklist();
  renderWater();
  renderStreak();
}

// ─── HEADER DATE ─────────────────────────────────────────
function renderHeader() {
  const now=new Date();
  document.getElementById('header-date').textContent=
    now.toLocaleDateString('en-IN',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase();
}

// ─── METRICS ─────────────────────────────────────────────
function renderMetrics() {
  const p=S.profile;
  const bmi=calcBMI(p.weight,p.height);
  const cals=calcCals(p);
  document.getElementById('bmi-num').textContent=bmi.toFixed(1);
  document.getElementById('bmi-cat').textContent=bmiCat(bmi).toUpperCase();
  document.getElementById('cal-num').textContent=cals.toLocaleString();

  const GL={lose:'🔥 Lose Weight',maintain:'⚖️ Maintain',gain:'💪 Gain'};
  const DL={veg:'🥦 Vegetarian',eggitarian:'🥚 Eggitarian',nonveg:'🍗 Non-Veg'};
  const RL={gym:'🏋️ Gym',cardio:'🏃 Cardio',both:'⚡ Both'};
  document.getElementById('c-goal').textContent=GL[p.goal]||p.goal;
  document.getElementById('c-diet').textContent=DL[p.diet]||p.diet;
  document.getElementById('c-routine').textContent=RL[p.routine]||p.routine;

  setTimeout(()=>animateBMI(bmi),200);
}

function animateBMI(bmi) {
  const arcLen=267;
  const pct=Math.min(1,Math.max(0,(bmi-10)/30));
  const arc=document.getElementById('bmi-arc');
  const needle=document.getElementById('bmi-needle');
  if(arc) { arc.style.strokeDashoffset=arcLen-(pct*arcLen); }
  if(needle) { const deg=(pct*180)-90; needle.style.transform=`rotate(${deg}deg)`; }
}

// ─── TODAY'S WORKOUT ────────────────────────────────────
function renderTodayWorkout() {
  const idx=todayDayIndex();
  const day=DAYS[idx];
  const ds=S.customSplit?.[day];
  const badge=document.getElementById('today-day-badge');
  badge.textContent=day.toUpperCase();

  const cont=document.getElementById('today-workout-content');
  cont.innerHTML='';

  if (!ds||!ds.active||ds.type==='rest') {
    cont.innerHTML=`<div class="tw-rest">😴 Rest Day<br><small>Recover, hydrate, and stretch.</small></div>`;
    return;
  }

  if (ds.type==='gym' && ds.split) {
    const sp=GYM_SPLITS[ds.split];
    if(sp) {
      cont.innerHTML=`
        <div class="tw-type">${sp.tag}</div>
        <div class="tw-name">${ds.split}</div>
        <ul class="tw-exs">${sp.exs.map(e=>`<li>${e}</li>`).join('')}</ul>`;
    }
  } else if (ds.type==='cardio') {
    const ct=CARDIO_DETAILS[ds.cardioType]||CARDIO_DETAILS['Steps Goal'];
    if (ds.cardioType==='Steps Goal') {
      cont.innerHTML=`
        <div class="tw-type">🏃 CARDIO — ${ds.cardioType.toUpperCase()}</div>
        <div class="tw-steps-goal">
          <div><div class="tw-steps-num">${(ds.cardioGoal||10000).toLocaleString()}</div>
          <div class="tw-steps-label">STEPS TARGET</div></div>
        </div>
        <div class="tw-type" style="margin-top:4px">${ct.desc(ds.cardioGoal)}</div>`;
    } else {
      cont.innerHTML=`
        <div class="tw-type">🏃 CARDIO — ${ds.cardioType.toUpperCase()}</div>
        <div class="tw-name">${ct.icon} ${ds.cardioType}</div>
        <div class="tw-type" style="margin-top:4px">${ct.desc(ds.cardioGoal)}</div>`;
    }
  } else if (ds.type==='both') {
    cont.innerHTML=`<div class="tw-type">⚡ GYM + CARDIO DAY</div>
      <div class="tw-name">${ds.split||'Full Body'} + ${ds.cardioType||'Steps Goal'}</div>`;
  }
}

// ─── MEALS ──────────────────────────────────────────────
function renderMeals() {
  const p=S.profile;
  const cals=calcCals(p);
  const db=MEALS[p.diet]||MEALS.veg;
  const rand=seededRand(S.mealSeed);
  const list=document.getElementById('meals-list');
  const sub=document.getElementById('meals-sub');
  sub.textContent=`Based on your ${p.diet==='veg'?'vegetarian':p.diet==='eggitarian'?'eggitarian':'non-vegetarian'} preference`;
  list.innerHTML='';

  [['breakfast','🌅 BREAKFAST'],['lunch','☀️ LUNCH'],['snack','🍵 SNACK'],['dinner','🌙 DINNER']].forEach(([slot,label])=>{
    const meal=pick(db[slot],rand);
    const kcal=Math.round(cals*meal.ratio);
    const card=document.createElement('div');
    card.className='meal-card';
    card.innerHTML=`
      <div class="meal-hdr"><span class="meal-type">${label}</span><span class="meal-kcal">~${kcal} kcal</span></div>
      <div class="meal-name">${meal.name}</div>
      <div class="meal-desc">${meal.desc}</div>`;
    list.appendChild(card);
  });
}

// ─── CHECKLIST ──────────────────────────────────────────
function renderChecklist() {
  const body=document.getElementById('checklist-body');
  body.innerHTML='';

  const idx=todayDayIndex();
  const day=DAYS[idx];
  const ds=S.customSplit?.[day];
  let workoutLabel='Complete Today\'s Workout';
  if (!ds||!ds.active||ds.type==='rest') workoutLabel='Rest Day — Stretch & Hydrate';
  else if (ds.type==='gym' && ds.split) workoutLabel=`Workout: ${ds.split}`;
  else if (ds.type==='cardio') workoutLabel=`Cardio: ${ds.cardioType}${ds.cardioType==='Steps Goal'?' ('+((ds.cardioGoal||10000).toLocaleString())+' steps)':''}`;
  else workoutLabel='Complete Gym + Cardio Session';

  const items=[...CHECKLIST,{id:'workout',icon:'🏋️',label:workoutLabel}];

  items.forEach(item=>{
    const done=S.tracker.checkedIds.includes(item.id);
    const div=document.createElement('div');
    div.className=`cl-item${done?' done':''}`;
    div.innerHTML=`
      <input type="checkbox" class="cl-check" id="cl-${item.id}" ${done?'checked':''}>
      <span class="cl-icon">${item.icon}</span>
      <label class="cl-label" for="cl-${item.id}">${item.label}</label>`;
    body.appendChild(div);

    const chk=div.querySelector('input');
    chk.addEventListener('change',()=>{
      if(chk.checked){ if(!S.tracker.checkedIds.includes(item.id)) S.tracker.checkedIds.push(item.id); }
      else S.tracker.checkedIds=S.tracker.checkedIds.filter(x=>x!==item.id);
      div.classList.toggle('done',chk.checked);
      save(K.TRACKER,S.tracker);
      updateProgress(items.length);
      if(item.id==='water'&&chk.checked){ S.tracker.water=8; save(K.TRACKER,S.tracker); renderWater(); }
    });
  });
  updateProgress(items.length);
}

function updateProgress(total) {
  const done=S.tracker.checkedIds.length;
  document.getElementById('prog-badge').textContent=`${done}/${total}`;
  document.getElementById('prog-bar').style.width=`${(done/total)*100}%`;
  if(done===total) {
    if(!S.dailyLogs[S.tracker.date]||!S.dailyLogs[S.tracker.date].success) {
      S.dailyLogs[S.tracker.date]={ date:S.tracker.date,done,total,water:S.tracker.water,success:true,status:'logged',checkedIds:[...S.tracker.checkedIds],notes:'' };
      save(K.DAILY_LOGS,S.dailyLogs);
      recalcStreak();
      renderStreak();
    }
  }
}

// ─── WATER ──────────────────────────────────────────────
function renderWater() {
  document.getElementById('water-cur').textContent=S.tracker.water;
  const gc=document.getElementById('water-glasses');
  gc.innerHTML='';
  for(let i=1;i<=8;i++){
    const b=document.createElement('button');
    b.className=`glass-btn${S.tracker.water>=i?' filled':''}`;
    b.title=`${i} glass${i>1?'es':''}`;
    b.addEventListener('click',()=>{
      S.tracker.water=S.tracker.water===i?i-1:i;
      syncWaterChecklist();
      save(K.TRACKER,S.tracker);
      renderWater(); renderChecklist();
    });
    gc.appendChild(b);
  }
}

function syncWaterChecklist() {
  if(S.tracker.water>=8){ if(!S.tracker.checkedIds.includes('water')) S.tracker.checkedIds.push('water'); }
  else S.tracker.checkedIds=S.tracker.checkedIds.filter(x=>x!=='water');
}

function setupWaterBtns() {
  document.getElementById('water-plus').addEventListener('click',()=>{
    if(S.tracker.water<8){ S.tracker.water++; syncWaterChecklist(); save(K.TRACKER,S.tracker); renderWater(); renderChecklist(); }
  });
  document.getElementById('water-minus').addEventListener('click',()=>{
    if(S.tracker.water>0){ S.tracker.water--; syncWaterChecklist(); save(K.TRACKER,S.tracker); renderWater(); renderChecklist(); }
  });
}

// ─── STREAK ─────────────────────────────────────────────
function renderStreak() {
  document.getElementById('streak-num').textContent=S.streak;
  const list=document.getElementById('hist-list');
  list.innerHTML='';
  const logs=Object.values(S.dailyLogs).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7);
  if(!logs.length){ list.innerHTML='<li class="hist-empty">No logs yet.</li>'; return; }
  logs.forEach(l=>{
    const li=document.createElement('li');
    li.className='hist-item';
    const fmt=formatDate(l.date,{month:'short',day:'numeric'}).toUpperCase();
    li.innerHTML=`<span class="hi-date">${fmt}</span>
      <span class="hi-status ${l.success?'hi-ok':'hi-miss'}">${l.success?'✓ '+l.done+'/'+l.total:'✗ '+l.done+'/'+l.total}</span>`;
    list.appendChild(li);
  });
}

// ─── WEIGHT MODAL ────────────────────────────────────────
function setupWeightModal() {
  document.getElementById('wi-save').addEventListener('click',()=>{
    const val=parseFloat(document.getElementById('wi-weight').value);
    if(!val||val<30||val>300){ showToast('Enter a valid weight (30–300 kg)'); return; }
    S.weightHist.push({ date:todayStr(), weight:val });
    save(K.WEIGHT_HIST,S.weightHist);
    S.lastWeighIn=todayStr();
    save(K.LAST_WI,S.lastWeighIn);
    // Update profile weight
    if(S.profile){ S.profile.weight=val; save(K.PROFILE,S.profile); renderMetrics(); }
    hide('weight-modal');
    showToast(`Weight logged: ${val} kg ✓`);
  });
  document.getElementById('wi-skip').addEventListener('click',()=>{
    S.lastWeighIn=todayStr(); save(K.LAST_WI,S.lastWeighIn);
    hide('weight-modal');
  });
  document.getElementById('btn-log-weight').addEventListener('click',showWeightModal);
}

// ─── DAY LOG MODAL ──────────────────────────────────────
let _logDate='';

function openLogModal(ds) {
  _logDate=ds;
  const isFuture=ds>todayStr();
  if(isFuture) return;

  const fmt=formatDate(ds,{weekday:'long',month:'long',day:'numeric'});
  document.getElementById('log-modal-date').textContent=fmt;

  const dayIdx=dayOfWeek(ds);
  const day=DAYS[dayIdx];
  const sp=S.customSplit?.[day];
  const existing=S.dailyLogs[ds]||{ checkedIds:[], water:0, notes:'' };

  const body=document.getElementById('log-modal-body');
  body.innerHTML='';

  // Workout info
  let workoutInfo='Rest Day';
  if(sp&&sp.active&&sp.type!=='rest'){
    if(sp.type==='gym') workoutInfo=sp.split||'Gym Session';
    else if(sp.type==='cardio') workoutInfo=sp.cardioType+(sp.cardioType==='Steps Goal'?' — '+(sp.cardioGoal||10000).toLocaleString()+' steps':'');
    else workoutInfo='Gym + Cardio';
  }

  const items=[...CHECKLIST,{id:'workout',icon:'🏋️',label:`Workout: ${workoutInfo}`}];

  let html=`<div class="log-section-title">WORKOUT PLAN</div>
    <div class="log-workout-info">${workoutInfo}</div>
    <div class="log-section-title" style="margin-top:12px">MARK COMPLETED</div>`;

  items.forEach(item=>{
    const done=(existing.checkedIds||[]).includes(item.id);
    html+=`<div class="log-check-row">
      <input type="checkbox" class="cl-check" id="lm-${item.id}" ${done?'checked':''}>
      <span>${item.icon}</span>
      <label class="log-check-label" for="lm-${item.id}">${item.label}</label>
    </div>`;
  });

  const isToday=ds===todayStr();
  if(!isToday){
    html+=`<div class="log-section-title" style="margin-top:12px">NOTES (OPTIONAL)</div>
      <div class="ig"><textarea id="lm-notes" placeholder="How did it go?">${existing.notes||''}</textarea></div>
      <div class="ig" style="margin-top:8px"><label>WATER GLASSES</label>
        <input type="number" id="lm-water" min="0" max="8" value="${existing.water||0}"></div>`;
  }

  body.innerHTML=html;
  show('log-modal');
}

function setupLogModal() {
  document.getElementById('close-log-modal').addEventListener('click',()=>hide('log-modal'));
  document.getElementById('log-cancel').addEventListener('click',()=>hide('log-modal'));
  document.getElementById('log-save').addEventListener('click',()=>{
    const ds=_logDate;
    const isToday=ds===todayStr();
    const items=[...CHECKLIST,{id:'workout'}];
    const checkedIds=items.filter(item=>{
      const el=document.getElementById(`lm-${item.id}`);
      return el&&el.checked;
    }).map(x=>x.id);

    if(isToday){
      S.tracker.checkedIds=checkedIds;
      save(K.TRACKER,S.tracker);
      renderChecklist(); renderWater();
    } else {
      const water=parseInt(document.getElementById('lm-water')?.value)||0;
      const notes=document.getElementById('lm-notes')?.value||'';
      const total=items.length;
      const done=checkedIds.length;
      const success=done>=Math.ceil(total*0.75);
      S.dailyLogs[ds]={ date:ds, done, total, water, success, checkedIds, notes, status:success?'logged':'partial' };
      save(K.DAILY_LOGS,S.dailyLogs);
      recalcStreak();
      renderStreak();
      renderCalendar();
    }
    hide('log-modal');
    showToast('Day logged ✓');
  });
}

// ─── CALENDAR ────────────────────────────────────────────
function renderCalendar() {
  const m=S.calMonth;
  const year=m.getFullYear(), month=m.getMonth();
  document.getElementById('cal-month-label').textContent=
    m.toLocaleDateString('en-IN',{month:'long',year:'numeric'}).toUpperCase();

  const firstDay=new Date(year,month,1);
  const lastDay=new Date(year,month+1,0);
  // Mon-first offset
  const startOffset=(firstDay.getDay()+6)%7;

  const grid=document.getElementById('cal-grid');
  grid.innerHTML='';

  const td=todayStr();

  // Empty cells before month start
  for(let i=0;i<startOffset;i++){
    const cell=document.createElement('div');
    cell.className='cal-cell empty'; grid.appendChild(cell);
  }

  for(let d=1;d<=lastDay.getDate();d++){
    const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cell=document.createElement('div');
    cell.className='cal-cell';

    const isToday=ds===td;
    const isFuture=ds>td;
    const log=S.dailyLogs[ds];
    const dayIdx=dayOfWeek(ds);
    const day=DAYS[dayIdx];
    const sp=S.customSplit?.[day];
    const isRest=!sp||!sp.active||sp.type==='rest';

    let icon='';
    if(isRest) { cell.classList.add('rest'); icon='😴'; }
    else if(isFuture) { cell.classList.add('future'); icon=sp?.type==='gym'?'🏋️':sp?.type==='cardio'?'🏃':'⚡'; }
    else if(log) {
      if(log.success)       { cell.classList.add('logged');  icon='✅'; }
      else if(log.done>0)   { cell.classList.add('partial'); icon='🔶'; }
      else                  { cell.classList.add('absent');  icon='❌'; }
    } else {
      // Past day with no log
      cell.classList.add('past-unlogged'); icon='❌';
    }

    if(isToday) cell.classList.add('today');
    if(!isFuture && !isRest) cell.style.cursor='pointer';

    cell.innerHTML=`
      <span class="cell-num">${d}</span>
      <span class="cell-icon">${icon}</span>
      ${isToday?'<span class="cell-today-label">TODAY</span>':''}`;

    if(!isFuture && !isRest) {
      cell.addEventListener('click',()=>openLogModal(ds));
    }
    grid.appendChild(cell);
  }

  document.getElementById('cal-prev').onclick=()=>{
    S.calMonth=new Date(year,month-1,1); renderCalendar();
  };
  document.getElementById('cal-next').onclick=()=>{
    if(new Date(year,month+1,1)<=new Date()) { S.calMonth=new Date(year,month+1,1); renderCalendar(); }
  };
}

// ─── SPLIT PAGE ──────────────────────────────────────────
function renderSplitPage() {
  const grid=document.getElementById('split-week-grid');
  grid.innerHTML='';
  DAYS.forEach(day=>{
    const ds=S.customSplit?.[day]||{ active:false, type:'rest' };
    const card=document.createElement('div');
    card.className=`split-day-card${(!ds.active||ds.type==='rest')?' rest-card':''}`;

    let typeLabel='REST', name='Rest & Recovery', exsHtml='', typeBadge='😴 Rest';
    if(ds.active && ds.type==='gym' && ds.split) {
      const sp=GYM_SPLITS[ds.split];
      typeLabel='GYM'; typeBadge='🏋️ Gym';
      name=ds.split;
      exsHtml=sp?sp.exs.slice(0,4).map(e=>`<li>${e}</li>`).join(''):'';
    } else if(ds.active && ds.type==='cardio') {
      const ct=CARDIO_DETAILS[ds.cardioType]||CARDIO_DETAILS['Steps Goal'];
      typeLabel='CARDIO'; typeBadge='🏃 Cardio';
      name=ds.cardioType;
      exsHtml=`<li>${ct.desc(ds.cardioGoal)}</li>`;
    } else if(ds.active && ds.type==='both') {
      typeLabel='GYM+CARDIO'; typeBadge='⚡ Both';
      name=`${ds.split||'Gym'} + ${ds.cardioType||'Cardio'}`;
    }

    card.innerHTML=`
      <div class="sdc-day">${day.toUpperCase()}</div>
      <span class="sdc-type-badge">${typeBadge}</span>
      <div class="sdc-name">${name}</div>
      ${exsHtml?`<ul class="sdc-exs">${exsHtml}</ul>`:''}`;
    grid.appendChild(card);
  });

  document.getElementById('btn-open-split-builder').onclick=openSplitBuilder;
}

// ─── SPLIT BUILDER MODAL ─────────────────────────────────
function openSplitBuilder() {
  const body=document.getElementById('split-builder-body');
  body.innerHTML='';

  DAYS.forEach(day=>{
    const ds=S.customSplit?.[day]||{ active:true, type:'gym', split:'Push Day' };
    const row=document.createElement('div');
    row.className='sb-row';

    const gymOptions=Object.keys(GYM_SPLITS).map(s=>`<option value="${s}" ${ds.split===s?'selected':''}>${s}</option>`).join('');
    const cardioOptions=CARDIO_TYPES.map(c=>`<option value="${c}" ${ds.cardioType===c?'selected':''}>${c}</option>`).join('');

    row.innerHTML=`
      <div class="sb-day-info">
        <div class="sb-day-name">${day}</div>
        <div class="sb-toggle-row">
          <label class="toggle">
            <input type="checkbox" id="sb-act-${day}" ${ds.active?'checked':''}>
            <span class="toggle-track"></span>
            <span class="toggle-thumb"></span>
          </label>
          <span class="sb-active-label" id="sb-lbl-${day}">${ds.active?'Active':'Rest'}</span>
        </div>
      </div>
      <div class="sb-type-col" id="sb-tc-${day}">
        <span class="sb-sublabel">TYPE</span>
        <div class="pills" style="flex-wrap:nowrap;gap:5px" id="sb-pills-${day}">
          <button type="button" class="pill${ds.type==='gym'?' active':''}" style="font-size:10px;padding:5px 8px" data-t="gym">🏋️ Gym</button>
          <button type="button" class="pill${ds.type==='cardio'?' active':''}" style="font-size:10px;padding:5px 8px" data-t="cardio">🏃 Cardio</button>
          <button type="button" class="pill${ds.type==='rest'?' active':''}" style="font-size:10px;padding:5px 8px" data-t="rest">😴 Rest</button>
        </div>
      </div>
      <div class="sb-detail-col" id="sb-dc-${day}">
        <span class="sb-sublabel">DETAIL</span>
        <select id="sb-gym-${day}" class="ig select" style="${ds.type!=='gym'?'display:none':''}">${gymOptions}</select>
        <div id="sb-cardio-${day}" style="${ds.type!=='cardio'?'display:none':''}; display:${ds.type==='cardio'?'flex':'none'}; flex-direction:column; gap:6px">
          <select id="sb-ctype-${day}">${cardioOptions}</select>
          <input type="number" id="sb-cgoal-${day}" placeholder="Goal (steps/min)" value="${ds.cardioGoal||10000}" style="background:var(--surf2);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:6px 8px;font-size:12px;outline:none">
        </div>
        <div id="sb-rest-msg-${day}" style="${ds.type!=='rest'?'display:none':'display:block'}; font-size:10px; color:var(--muted); padding-top:8px">Rest day — no workout.</div>
      </div>`;
    body.appendChild(row);

    // Toggle active
    const actChk=row.querySelector(`#sb-act-${day}`);
    const lbl=row.querySelector(`#sb-lbl-${day}`);
    actChk.addEventListener('change',()=>{
      lbl.textContent=actChk.checked?'Active':'Rest';
    });

    // Type pills
    const pillsC=row.querySelector(`#sb-pills-${day}`);
    const gymSel=row.querySelector(`#sb-gym-${day}`);
    const cardioDiv=row.querySelector(`#sb-cardio-${day}`);
    const restMsg=row.querySelector(`#sb-rest-msg-${day}`);

    pillsC.querySelectorAll('.pill').forEach(p=>{
      p.addEventListener('click',()=>{
        pillsC.querySelectorAll('.pill').forEach(x=>x.classList.remove('active'));
        p.classList.add('active');
        const t=p.dataset.t;
        gymSel.style.display=t==='gym'?'':'none';
        cardioDiv.style.display=t==='cardio'?'flex':'none';
        restMsg.style.display=t==='rest'?'block':'none';
      });
    });
  });

  show('split-modal');
}

function setupSplitModal() {
  document.getElementById('close-split-modal').addEventListener('click',()=>hide('split-modal'));
  document.getElementById('split-cancel').addEventListener('click',()=>hide('split-modal'));
  document.getElementById('split-save').addEventListener('click',()=>{
    DAYS.forEach(day=>{
      const actEl=document.getElementById(`sb-act-${day}`);
      const active=actEl?actEl.checked:false;
      const activePill=document.querySelector(`#sb-pills-${day} .pill.active`);
      const type=activePill?activePill.dataset.t:'rest';
      const gymSplit=document.getElementById(`sb-gym-${day}`)?.value||'Push Day';
      const cardioType=document.getElementById(`sb-ctype-${day}`)?.value||'Steps Goal';
      const cardioGoal=parseInt(document.getElementById(`sb-cgoal-${day}`)?.value)||10000;

      S.customSplit[day]={ active, type, split:gymSplit, cardioType, cardioGoal };
    });
    save(K.CUSTOM_SPLIT,S.customSplit);
    hide('split-modal');
    renderTodayWorkout();
    renderChecklist();
    renderSplitPage();
    showToast('Split saved! 💪');
  });
}

// ─── PROGRESS TAB ────────────────────────────────────────
function renderProgress() {
  const p=S.profile;
  const bmi=calcBMI(p.weight,p.height);
  document.getElementById('prog-bmi').textContent=bmi.toFixed(1);
  document.getElementById('prog-weight').innerHTML=`${p.weight}<span class="prog-unit">kg</span>`;

  const totalLogged=Object.values(S.dailyLogs).filter(l=>l.success).length;
  document.getElementById('prog-days').textContent=totalLogged;

  // Best streak from history
  let best=0,cur=0;
  const sorted=Object.values(S.dailyLogs).sort((a,b)=>a.date.localeCompare(b.date));
  sorted.forEach(l=>{ if(l.success) cur++; else cur=0; if(cur>best) best=cur; });
  document.getElementById('prog-best-streak').innerHTML=`${best}<span class="prog-unit">days</span>`;

  // Weight chart
  renderWeightChart();

  // Full history
  const fh=document.getElementById('full-history');
  fh.innerHTML='';
  const allLogs=Object.values(S.dailyLogs).sort((a,b)=>b.date.localeCompare(a.date));
  if(!allLogs.length){ fh.innerHTML='<div style="color:var(--muted);font-size:11px;text-align:center;padding:20px">No activity logged yet.</div>'; return; }
  allLogs.forEach(l=>{
    const div=document.createElement('div'); div.className='fh-row';
    const fmt=formatDate(l.date,{weekday:'short',month:'short',day:'numeric'}).toUpperCase();
    const dayIdx=dayOfWeek(l.date);
    const day=DAYS[dayIdx];
    const sp=S.customSplit?.[day];
    let detail=sp?.type==='gym'?sp.split:sp?.type==='cardio'?sp.cardioType:'Rest';
    div.innerHTML=`
      <span class="fh-date">${fmt}</span>
      <span class="fh-status ${l.success?'fh-ok':'fh-miss'}">${l.success?'✓ Complete':'✗ Incomplete'}</span>
      <span class="fh-detail">${l.done||0}/${l.total||7} · 💧${l.water||0} · ${detail||'—'}</span>`;
    fh.appendChild(div);
  });
}

function renderWeightChart() {
  const el=document.getElementById('weight-chart');
  const tbl=document.getElementById('weight-table');
  tbl.innerHTML='';

  const hist=[...S.weightHist].sort((a,b)=>a.date.localeCompare(b.date));
  if(!hist.length){ el.innerHTML='<div class="chart-empty">No weight data yet. Log your first weight!</div>'; return; }

  // SVG bar chart
  const W=Math.max(400,hist.length*60), H=120;
  const maxW=Math.max(...hist.map(h=>h.weight));
  const minW=Math.min(...hist.map(h=>h.weight));
  const range=maxW-minW||5;
  const pad=10;

  let svgPath=``, dots=``, labels=``;
  hist.forEach((h,i)=>{
    const x=pad+(i*(W-pad*2)/(hist.length-1||1));
    const y=H-pad-((h.weight-minW)/range)*(H-pad*2);
    if(i===0) svgPath+=`M ${x} ${y}`;
    else svgPath+=` L ${x} ${y}`;
    dots+=`<circle cx="${x}" cy="${y}" r="4" fill="#fff"/>`;
    const lbl=formatDate(h.date,{month:'short',day:'numeric'});
    labels+=`<text x="${x}" y="${H-1}" text-anchor="middle" fill="#555" font-size="9" font-family="Inter">${lbl}</text>`;
  });

  el.innerHTML=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <path d="${svgPath}" fill="none" stroke="#444" stroke-width="1.5"/>
    ${dots}${labels}
  </svg>`;
  el.style.minWidth=`${W}px`;

  // Table
  hist.reverse().forEach((h,i)=>{
    const prev=hist[i+1];
    const diff=prev?h.weight-prev.weight:null;
    const row=document.createElement('div'); row.className='wt-row';
    const fmt=formatDate(h.date,{month:'short',day:'numeric',year:'numeric'}).toUpperCase();
    row.innerHTML=`
      <span class="wt-date">${fmt}</span>
      <span class="wt-val">${h.weight} kg</span>
      <span class="wt-diff ${diff===null?'':diff>0?'wt-up':'wt-down'}">${diff===null?'—':diff>0?'▲ +'+diff.toFixed(1):'▼ '+diff.toFixed(1)} kg</span>`;
    tbl.appendChild(row);
  });
}


function setupMealModal() {
  const pillsC = document.getElementById('mm-diet-pills');
  if (pillsC && !pillsC._init) {
    pillsC._init = true;
    pillsC.querySelectorAll('.pill').forEach(p => {
      p.addEventListener('click', () => {
        pillsC.querySelectorAll('.pill').forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        document.getElementById('mm-diet').value = p.dataset.v;
      });
    });
  }
  ['close-meal-modal','mm-cancel'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el._init) { el._init=true; el.addEventListener('click', () => hide('meal-modal')); }
  });

  const saveBtn = document.getElementById('mm-save');
  if (saveBtn && !saveBtn._init) {
    saveBtn._init = true;
    saveBtn.addEventListener('click', () => {
      const name  = document.getElementById('mm-name').value.trim();
      const kcal  = parseInt(document.getElementById('mm-kcal').value) || 0;
      const errEl = document.getElementById('mm-err');
      if (!name || !kcal) { errEl.classList.remove('hidden'); return; }
      errEl.classList.add('hidden');

      const mealObj = {
        id:      S._editMealId || `cm_${Date.now()}`,
        name,
        slot:    document.getElementById('mm-slot').value,
        desc:    document.getElementById('mm-desc').value.trim(),
        kcal,
        protein: parseInt(document.getElementById('mm-protein').value) || 0,
        diet:    document.getElementById('mm-diet').value,
      };

      if (S._editMealId) {
        const idx = S.myMeals.findIndex(m => m.id === S._editMealId);
        if (idx !== -1) S.myMeals[idx] = mealObj;
        Object.keys(S.customPlan).forEach(slot => {
          if (S.customPlan[slot]?.id === S._editMealId) S.customPlan[slot] = mealObj;
        });
        save(K.CUSTOM_PLAN, S.customPlan);
      } else {
        S.myMeals.push(mealObj);
      }
      save(K.MY_MEALS, S.myMeals);
      hide('meal-modal');
      renderMealsTab();
      showToast(S._editMealId ? `Updated "${name}" ✓` : `"${name}" added ✓`);
      S._editMealId = null;
    });
  }
}


function openPickMealModal(slot) {
  S._pickSlot = slot;
  document.getElementById('pick-modal-title').textContent = `Pick for ${slot.charAt(0).toUpperCase()+slot.slice(1)}`;
  const list = document.getElementById('pick-meal-list');
  list.innerHTML = '';
  const currentId = S.customPlan[slot]?.id || null;
  const diet      = S.profile?.diet || 'veg';

  // My saved meals for this slot
  const mine = S.myMeals.filter(m => m.slot===slot && (m.diet==='all'||m.diet===diet));
  if (mine.length) {
    const t=document.createElement('div'); t.className='pick-section-title'; t.textContent='MY SAVED MEALS'; list.appendChild(t);
    mine.forEach(meal => list.appendChild(buildPickItem(meal, meal.id===currentId, ()=>selectPickedMeal(meal))));
  }

  // Default library
  const defaults = (MEALS[diet]||MEALS.veg)[slot] || [];
  if (defaults.length) {
    const t=document.createElement('div'); t.className='pick-section-title'; t.textContent='DEFAULT LIBRARY'; list.appendChild(t);
    defaults.forEach((meal,i) => {
      const m={...meal, id:`default_${slot}_${i}`, slot};
      list.appendChild(buildPickItem(m, currentId===m.id, ()=>selectPickedMeal(m)));
    });
  }
  show('pick-meal-modal');
}

function buildPickItem(meal, selected, onClick) {
  const item = document.createElement('div');
  item.className = `pick-item${selected?' selected':''}`;
  item.innerHTML = `
    <div class="pick-item-check"></div>
    <div class="pick-item-body">
      <div class="pick-item-name">${meal.name}</div>
      ${meal.desc?`<div class="pick-item-desc">${meal.desc}</div>`:''}
      <div class="pick-item-meta">${meal.kcal?`~${meal.kcal} kcal`:meal.ratio?`~${Math.round((calcCals(S.profile)||2000)*meal.ratio)} kcal`:''}${meal.protein?` · ${meal.protein}g protein`:''}</div>
    </div>`;
  item.addEventListener('click', onClick);
  return item;
}

function selectPickedMeal(meal) {
  S.customPlan[S._pickSlot] = meal;
  save(K.CUSTOM_PLAN, S.customPlan);
  if (S.mealMode !== 'custom') setMealMode('custom');
  hide('pick-meal-modal');
  renderMealSlots();
  showToast(`"${meal.name}" pinned to ${S._pickSlot} ✓`);
}

function setupPickMealModal() {
  ['close-pick-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el._init) { el._init=true; el.addEventListener('click', () => hide('pick-meal-modal')); }
  });
}

// ─── Hook meals tab into nav + init ──────────────────
// Patch the existing tab switcher to call renderMealsTab when meals tab is opened
const _origNavHandler = null;
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-tab="meals"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (S.profile) { initMeals(); renderMealsTab(); }
    });
  });
});
