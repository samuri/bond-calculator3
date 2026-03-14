import React, { useState, useMemo, useCallback } from 'react';
import './index.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Wallet, Calculator, Percent, Repeat, Layers, Coins, CheckCircle2, ArrowRightLeft, Zap } from 'lucide-react';

const App = () => {
  const formatNum = (val) => new Intl.NumberFormat('ru-RU').format(val);

  // Состояния
  const [principal, setPrincipal] = useState(1000000);
  const [bondPrice, setBondPrice] = useState(1000);
  const [yieldSingle, setYieldSingle] = useState(10.0);
  const [yieldMonthly, setYieldMonthly] = useState(10.0);
  const [years, setYears] = useState(10);
  const [taxRate, setTaxRate] = useState(13);
  const [reinvest, setReinvest] = useState(true);
  const [useLotSize, setUseLotSize] = useState(true);

  // Функция расчета финального капитала (утилита)
  const calculateFinal = useCallback((rate, freq) => {
    let cap = principal;
    let cash = 0;
    const netRate = (rate / 100) * (1 - taxRate / 100);
    
    for (let m = 1; m <= years * 12; m++) {
      if (reinvest) {
        if (m % (12 / freq) === 0) {
          const coupon = cap * (netRate / freq);
          const available = coupon + cash;
          if (useLotSize) {
            const bondsToBuy = Math.floor(available / bondPrice);
            cap += bondsToBuy * bondPrice;
            cash = available - (bondsToBuy * bondPrice);
          } else {
            cap += available;
            cash = 0;
          }
        }
      }
    }
    return cap + cash;
  }, [principal, bondPrice, years, taxRate, reinvest, useLotSize]);

  // Основные расчеты
  const { results, breakEvenRate, effSingle, effMonthly } = useMemo(() => {
    const data = [];
    let curS = principal; let sCash = 0;
    let curM = principal; let mCash = 0;
    const netS = (yieldSingle / 100) * (1 - taxRate / 100);
    const netM = (yieldMonthly / 100) * (1 - taxRate / 100);

    data.push({ year: 0, single: principal, monthly: principal });

    for (let m = 1; m <= years * 12; m++) {
      if (reinvest) {
        if (m % 6 === 0) {
          const coup = curS * (netS / 2);
          const avail = coup + sCash;
          const toBuy = useLotSize ? Math.floor(avail / bondPrice) : avail / bondPrice;
          curS += toBuy * (useLotSize ? bondPrice : 1);
          sCash = avail - (useLotSize ? toBuy * bondPrice : 0);
        }
        const mCoup = curM * (netM / 12);
        const mAvail = mCoup + mCash;
        const mToBuy = useLotSize ? Math.floor(mAvail / bondPrice) : mAvail / bondPrice;
        curM += mToBuy * (useLotSize ? bondPrice : 1);
        mCash = mAvail - (useLotSize ? mToBuy * bondPrice : 0);
      }
      if (m % 12 === 0) {
        data.push({ year: m / 12, single: Math.round(curS + sCash), monthly: Math.round(curM + mCash) });
      }
    }

    const finalS = curS + sCash;
    const finalM = curM + mCash;

    // Расчет Эффективной доходности (CAGR)
    const getEff = (final) => ((Math.pow(final / principal, 1 / years) - 1) * 100).toFixed(2);

    // Точка равновесия
    const target = finalS;
    let low = 0, high = 40, bRate = 0;
    for(let i=0; i<15; i++) {
      bRate = (low + high) / 2;
      if (calculateFinal(bRate, 12) < target) low = bRate;
      else high = bRate;
    }

    return { 
      results: data, 
      breakEvenRate: bRate.toFixed(2),
      effSingle: getEff(finalS),
      effMonthly: getEff(finalM)
    };
  }, [principal, yieldSingle, yieldMonthly, bondPrice, years, taxRate, reinvest, useLotSize, calculateFinal]);

  const InputBlock = ({ label, icon: Icon, value, onChange, min, max, step, suffix, activeColor }) => (
    <div className="bg-slate-50/80 p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Icon size={14} className={activeColor} /> {label}
        </div>
        <div className="bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-inner flex items-center">
          <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className={`w-24 text-right font-black text-sm focus:outline-none bg-transparent ${activeColor}`} />
          <span className="ml-1 text-[11px] font-bold text-slate-400">{suffix}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8 font-sans text-slate-900 leading-tight">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-3">
            <Layers className="text-blue-600" size={32} /> Моделирование инвестиционных стратегий
          </h1>
        </header>

        {/* ТОП-БАР: ИТОГИ И ЭФФЕКТИВНОСТЬ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Итого: Стратегия 1</div>
            <div className="text-2xl font-black mb-2">{formatNum(results[results.length-1].single)} ₽</div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[11px] font-bold">
              <Zap size={12} /> Эфф. доходность: {effSingle}%
            </div>
          </div>

          <div className="bg-emerald-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-emerald-200 relative overflow-hidden group">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Итого: Лестница</div>
            <div className="text-2xl font-black mb-2">{formatNum(results[results.length-1].monthly)} ₽</div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[11px] font-bold">
              <Zap size={12} /> Эфф. доходность: {effMonthly}%
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col justify-center">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
              <ArrowRightLeft size={12}/> Точка равновесия
            </div>
            <div className="text-sm font-bold text-slate-600">
              Лестнице достаточно <span className="text-emerald-600 text-lg font-black">{breakEvenRate}%</span>, чтобы сравняться со Стратегией 1
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-[3rem] shadow-xl shadow-slate-200/60 border border-white space-y-4">
              <h2 className="text-xl font-black text-slate-700 mb-4 px-2">Настройки</h2>
              <InputBlock label="Стартовый капитал" value={principal} onChange={setPrincipal} min={100000} max={10000000} step={100000} suffix="₽" icon={Wallet} activeColor="text-blue-600" />
              <InputBlock label="Цена одной облигации" value={bondPrice} onChange={setBondPrice} min={10} max={10000} step={10} suffix="₽" icon={Coins} activeColor="text-orange-500" />
              <div className="p-5 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50 space-y-4">
                <InputBlock label="Доходность 1 (2 выплат/год)" value={yieldSingle} onChange={setYieldSingle} min={0} max={40} step={0.1} suffix="%" icon={Percent} activeColor="text-indigo-600" />
                <InputBlock label="Лестница (12 выплат/год)" value={yieldMonthly} onChange={setYieldMonthly} min={0} max={40} step={0.1} suffix="%" icon={TrendingUp} activeColor="text-emerald-600" />
              </div>
              <InputBlock label="Срок инвестирования" value={years} onChange={setYears} min={1} max={50} step={1} suffix="ЛЕТ" icon={Calendar} activeColor="text-slate-700" />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-[3rem] shadow-xl shadow-slate-200/60 border border-white">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" stroke="#cbd5e1" fontSize={12} />
                    <YAxis stroke="#cbd5e1" fontSize={12} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(val) => formatNum(val) + ' ₽'} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" name="Выпуск 1" dataKey="single" stroke="#6366f1" strokeWidth={5} dot={false} />
                    <Line type="monotone" name="Лестница" dataKey="monthly" stroke="#10b981" strokeWidth={5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-white">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="p-4">Год</th>
                    <th className="p-4 text-center">Стратегия 1</th>
                    <th className="p-4 text-center">Лестница</th>
                    <th className="p-4 text-right">Разница</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold text-slate-600">
                  {results.filter((_, i) => i % Math.max(1, Math.floor(years/10)) === 0 || i === results.length-1).map((r) => (
                    <tr key={r.year} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-slate-400">{r.year} л.</td>
                      <td className="p-4 text-center">{formatNum(r.single)} ₽</td>
                      <td className="p-4 text-center text-emerald-600">{formatNum(r.monthly)} ₽</td>
                      <td className="p-4 text-right text-xs opacity-50">+{formatNum(r.monthly - r.single)} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;