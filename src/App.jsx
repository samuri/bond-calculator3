import React, { useState, useMemo, useCallback } from 'react';
import './index.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Wallet, Calculator, Percent, Repeat, Layers, Coins, CheckCircle2 } from 'lucide-react';

const App = () => {
  // Состояния (настройки)
  const [principal, setPrincipal] = useState(1000000);
  const [bondPrice, setBondPrice] = useState(1000); // Цена облигации
  const [yieldSingle, setYieldSingle] = useState(12.5);
  const [yieldMonthly, setYieldMonthly] = useState(12.0);
  const [years, setYears] = useState(10);
  const [taxRate, setTaxRate] = useState(13);
  const [reinvest, setReinvest] = useState(true);
  const [useLotSize, setUseLotSize] = useState(true);

  // Математика модели
  const results = useMemo(() => {
    const data = [];
    let curSinglePrincipal = principal;
    let singleCash = 0;
    let curMonthlyPrincipal = principal;
    let monthlyCash = 0;

    const netRateSingle = (yieldSingle / 100) * (1 - taxRate / 100);
    const netRateMonthly = (yieldMonthly / 100) * (1 - taxRate / 100);

    data.push({
      month: 0,
      single: Math.round(curSinglePrincipal + singleCash),
      monthly: Math.round(curMonthlyPrincipal + monthlyCash),
    });

    for (let m = 1; m <= years * 12; m++) {
      if (reinvest) {
        // Стратегия 1 (выплаты 2 раза в год)
        if (m % 6 === 0) {
          const coupon = curSinglePrincipal * (netRateSingle / 2);
          const available = coupon + singleCash;
          if (useLotSize) {
            const bondsToBuy = Math.floor(available / bondPrice);
            curSinglePrincipal += bondsToBuy * bondPrice;
            singleCash = available - (bondsToBuy * bondPrice);
          } else {
            curSinglePrincipal += available;
            singleCash = 0;
          }
        }
        // Стратегия 2 (выплаты ежемесячно)
        const monthlyCoupon = curMonthlyPrincipal * (netRateMonthly / 12);
        const availableMonthly = monthlyCoupon + monthlyCash;
        if (useLotSize) {
          const bondsToBuy = Math.floor(availableMonthly / bondPrice);
          curMonthlyPrincipal += bondsToBuy * bondPrice;
          monthlyCash = availableMonthly - (bondsToBuy * bondPrice);
        } else {
          curMonthlyPrincipal += availableMonthly;
          monthlyCash = 0;
        }
      }
      if (m % 12 === 0 || m === years * 12) {
        data.push({ 
          month: m / 12, 
          single: Math.round(curSinglePrincipal + singleCash), 
          monthly: Math.round(curMonthlyPrincipal + monthlyCash) 
        });
      }
    }
    return data;
  }, [principal, yieldSingle, yieldMonthly, bondPrice, years, taxRate, reinvest, useLotSize]);

  // Универсальный блок ввода (бегунок + цифры)
  const InputBlock = useCallback(({ label, sublabel, icon: Icon, value, onChange, min, max, step, suffix, activeColor }) => (
    <div className="bg-slate-50/80 p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Icon size={14} className={activeColor} />
            {label}
          </div>
          {sublabel && <div className="text-[11px] text-slate-400 italic leading-tight">{sublabel}</div>}
        </div>
        <div className="bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-inner flex items-center">
          <input 
            type="number" 
            value={value} 
            onChange={(e) => onChange(Number(e.target.value))}
            className={`w-20 text-right font-black text-sm focus:outline-none bg-transparent ${activeColor.replace('bg-', 'text-')}`}
          />
          <span className="ml-1 text-[11px] font-bold text-slate-400">{suffix}</span>
        </div>
      </div>
      <input 
        type="range" 
        min={min} max={max} step={step} 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-blue-600"
      />
    </div>
  ), []);

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8 font-sans text-slate-900 leading-tight">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center space-y-2 mb-8">
          <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-3">
            <Layers className="text-blue-600" size={32} /> Моделирование стратегий портфеля
          </h1>
          <p className="text-slate-400 text-sm font-medium italic">Интерактивный анализ влияния структуры выплат на доходность</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Колонка настроек */}
          <div className="bg-white p-6 rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-white space-y-4 h-fit">
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-xl font-black text-slate-700">Настройки</h2>
              <Calculator className="text-slate-300" size={24} />
            </div>

            <InputBlock label="Стартовый капитал" value={principal} onChange={setPrincipal} min={1000} max={10000000} step={10000} suffix="₽" icon={Wallet} activeColor="text-blue-600" />
            
            {/* ТО САМОЕ ОКОШКО С ЦЕНОЙ */}
            <InputBlock label="Цена одной облигации" value={bondPrice} onChange={setBondPrice} min={10} max={10000} step={10} suffix="₽" icon={Coins} activeColor="text-orange-500" />

            <div className="p-5 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50 space-y-4">
               <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Доходность стратегий</div>
                  <div className="text-[11px] text-slate-400 italic">Укажите доходность (% годовых) для каждого варианта</div>
               </div>
              <InputBlock label="Один выпуск (2 вып/г)" value={yieldSingle} onChange={setYieldSingle} min={0} max={40} step={0.1} suffix="%" icon={Percent} activeColor="text-indigo-600" />
              <InputBlock label="Лестница (12 вып/г)" value={yieldMonthly} onChange={setYieldMonthly} min={0} max={40} step={0.1} suffix="%" icon={TrendingUp} activeColor="text-emerald-600" />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 cursor-pointer shadow-sm hover:border-blue-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-600"><CheckCircle2 size={18}/></div>
                  <span className="text-xs font-black text-slate-600">Учет цены лота</span>
                </div>
                <input type="checkbox" checked={useLotSize} onChange={(e) => setUseLotSize(e.target.checked)} className="w-6 h-6 accent-blue-600" />
              </label>
              <label className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 cursor-pointer shadow-sm hover:border-indigo-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600"><Repeat size={18}/></div>
                  <span className="text-xs font-black text-slate-600">Реинвестирование</span>
                </div>
                <input type="checkbox" checked={reinvest} onChange={(e) => setReinvest(e.target.checked)} className="w-6 h-6 accent-indigo-600" />
              </label>
            </div>

            <InputBlock label="Срок (лет)" value={years} onChange={setYears} min={1} max={50} step={1} suffix="ЛЕТ" icon={Calendar} activeColor="text-slate-700" />
          </div>

          {/* Колонка результатов */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-white">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#cbd5e1" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis stroke="#cbd5e1" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px', fontWeight: 'bold' }}
                      formatter={(val) => new Intl.NumberFormat('ru-RU').format(val) + ' ₽'}
                    />
                    <Line type="monotone" name="Выпуск 1" dataKey="single" stroke="#6366f1" strokeWidth={5} dot={false} />
                    <Line type="monotone" name="Лестница" dataKey="monthly" stroke="#10b981" strokeWidth={5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Итог: Стратегия 1</div>
                <div className="text-3xl font-black">{new Intl.NumberFormat('ru-RU').format(results[results.length-1].single)} ₽</div>
              </div>
              <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-200">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Итог: Лестница</div>
                <div className="text-3xl font-black">{new Intl.NumberFormat('ru-RU').format(results[results.length-1].monthly)} ₽</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;