import React, { useState, useMemo, useCallback } from 'react';
import './index.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Wallet, Calculator, Percent, Repeat, Layers, Coins, Info } from 'lucide-react';

const App = () => {
  const [principal, setPrincipal] = useState(1000000);
  const [yieldSingle, setYieldSingle] = useState(12.5);
  const [yieldMonthly, setYieldMonthly] = useState(12.0);
  const [bondPrice, setBondPrice] = useState(1000);
  const [years, setYears] = useState(10);
  const [taxRate, setTaxRate] = useState(13);
  const [reinvest, setReinvest] = useState(true);
  const [useLotSize, setUseLotSize] = useState(true);

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
        data.push({ month: m / 12, single: Math.round(curSinglePrincipal + singleCash), monthly: Math.round(curMonthlyPrincipal + monthlyCash) });
      }
    }
    return data;
  }, [principal, yieldSingle, yieldMonthly, bondPrice, years, taxRate, reinvest, useLotSize]);

  const InputBlock = useCallback(({ label, sublabel, icon: Icon, value, onChange, min, max, step, suffix = "", colorClass = "blue" }) => (
    <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            <Icon size={12} className={`text-${colorClass}-500`} />
            {label}
          </div>
          {sublabel && <div className="text-[11px] text-slate-400 italic leading-tight mb-2">{sublabel}</div>}
        </div>
        <div className="bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm flex items-center">
          <input 
            type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
            className={`w-20 text-right font-black text-sm text-${colorClass}-600 focus:outline-none bg-transparent`}
          />
          <span className="ml-1 text-[11px] font-bold text-slate-400">{suffix}</span>
        </div>
      </div>
      <input 
        type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-${colorClass}-500 bg-slate-200`}
      />
    </div>
  ), []);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900 leading-tight">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center space-y-3 mb-10">
          <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Моделирование стратегий портфеля</h1>
          <p className="text-slate-400 text-sm font-medium">Сравнение классического подхода и «купонной лестницы»</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 space-y-5 h-fit">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-black text-slate-700">Настройки</h2>
              <Calculator className="text-slate-300" size={20} />
            </div>

            <InputBlock label="Стартовый капитал" value={principal} onChange={setPrincipal} min={1000} max={10000000} step={10000} suffix="₽" icon={Wallet} />
            
            <InputBlock label="Цена одной облигации" value={bondPrice} onChange={setBondPrice} min={10} max={100000} step={10} suffix="₽" icon={Coins} />

            <div className="bg-blue-50/30 p-4 rounded-3xl border border-blue-100/50 space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-blue-500">Процентные ставки стратегий</div>
              <div className="text-[11px] text-slate-400 italic -mt-2">Укажите доходность (% годовых) для каждого варианта</div>
              
              <InputBlock label="Один выпуск (2 вып./год)" value={yieldSingle} onChange={setYieldSingle} min={0} max={40} step={0.1} suffix="%" icon={Percent} colorClass="indigo" />
              <InputBlock label="Лестница (12 вып./год)" value={yieldMonthly} onChange={setYieldMonthly} min={0} max={40} step={0.1} suffix="%" icon={TrendingUp} colorClass="emerald" />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg text-white"><CheckCircle2 size={16}/></div>
                  <span className="text-xs font-bold text-slate-600">Учет цены лота</span>
                </div>
                <input type="checkbox" checked={useLotSize} onChange={(e) => setUseLotSize(e.target.checked)} className="w-5 h-5 accent-blue-500" />
              </label>
              <label className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500 rounded-lg text-white"><Repeat size={16}/></div>
                  <span className="text-xs font-bold text-slate-600">Реинвестирование</span>
                </div>
                <input type="checkbox" checked={reinvest} onChange={(e) => setReinvest(e.target.checked)} className="w-5 h-5 accent-indigo-500" />
              </label>
            </div>

            <InputBlock label="Срок инвестирования" value={years} onChange={setYears} min={1} max={50} step={1} suffix="ЛЕТ" icon={Calendar} colorClass="slate" />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#cbd5e1" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis stroke="#cbd5e1" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="single" stroke="#6366f1" strokeWidth={4} dot={false} />
                    <Line type="monotone" dataKey="monthly" stroke="#10b981" strokeWidth={4} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-lg shadow-indigo-200">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Итог: Стратегия 1</div>
                <div className="text-3xl font-black">{new Intl.NumberFormat('ru-RU').format(results[results.length-1].single)} ₽</div>
              </div>
              <div className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-lg shadow-emerald-200">
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

const Repeat = ({size, className}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>;
const CheckCircle2 = ({size, className}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;

export default App;