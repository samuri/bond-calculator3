import React, { useState, useMemo, useCallback } from 'react';
import './index.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Wallet, Calculator, Percent, Repeat, Layers, Coins } from 'lucide-react';

const App = () => {
  // Состояния
  const [principal, setPrincipal] = useState(1000000);
  const [yieldSingle, setYieldSingle] = useState(12.5);
  const [yieldMonthly, setYieldMonthly] = useState(12.0);
  const [bondPrice, setBondPrice] = useState(1000);
  const [years, setYears] = useState(10);
  const [taxRate, setTaxRate] = useState(13);
  const [reinvest, setReinvest] = useState(true);
  const [useLotSize, setUseLotSize] = useState(true);

  // Расчеты (оптимизировано через useMemo)
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
        // Выплата раз в полгода
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

        // Выплата ежемесячно (Лестница)
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
          monthly: Math.round(curMonthlyPrincipal + monthlyCash),
        });
      }
    }
    return data;
  }, [principal, yieldSingle, yieldMonthly, bondPrice, years, taxRate, reinvest, useLotSize]);

  // Оптимизированный компонент ввода
  const InputGroup = useCallback(({ label, icon: Icon, value, onChange, min, max, step, suffix = "" }) => (
    <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:border-blue-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
          <Icon size={16} className="text-blue-500" />
          <span>{label}</span>
        </div>
        <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-20 text-right font-bold text-blue-600 focus:outline-none bg-transparent"
          />
          <span className="ml-1 text-slate-400 text-xs font-medium">{suffix}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700"
      />
    </div>
  ), []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 leading-tight">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-2xl mb-2 text-blue-700">
            <Layers size={24} />
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">
            Моделирование инвестиционных стратегий
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">
            Сравнение классического портфеля и «купонной лестницы» с учетом реинвестирования и налогов
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Настройки */}
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2">
              <Calculator size={18} className="text-blue-600" /> Параметры модели
            </h2>

            <InputGroup 
              label="Начальный капитал" icon={Wallet} 
              value={principal} onChange={setPrincipal} 
              min={1000} max={10000000} step={10000} suffix="₽"
            />

            <InputGroup 
              label="Доходность (Выпуск 1)" icon={Percent} 
              value={yieldSingle} onChange={setYieldSingle} 
              min={0} max={40} step={0.1} suffix="%"
            />

            <InputGroup 
              label="Доходность (Лестница)" icon={TrendingUp} 
              value={yieldMonthly} onChange={setYieldMonthly} 
              min={0} max={40} step={0.1} suffix="%"
            />

            <InputGroup 
              label="Срок (лет)" icon={Calendar} 
              value={years} onChange={setYears} 
              min={1} max={50} step={1} suffix="л."
            />

            <div className="pt-2 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" checked={reinvest} onChange={(e) => setReinvest(e.target.checked)} className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600" />
                </div>
                <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors">Авто-реинвестирование</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={useLotSize} onChange={(e) => setUseLotSize(e.target.checked)} className="w-5 h-5 rounded-md border-slate-300 text-blue-600 accent-blue-600" />
                <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors">С учетом лотности (по {bondPrice}₽)</span>
              </label>
            </div>
          </div>

          {/* Визуализация */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="text-emerald-500" /> Динамика портфеля
                </h2>
                <div className="flex gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Стратегия 1</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Лестница</div>
                </div>
              </div>

              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                    <Tooltip 
                      formatter={(val) => new Intl.NumberFormat('ru-RU').format(val) + ' ₽'}
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                    />
                    <Line type="monotone" dataKey="single" stroke="#3b82f6" strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="monthly" stroke="#10b981" strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Карточки итогов */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Coins size={80} />
                </div>
                <div className="relative z-10">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Итоговый капитал (С1)</div>
                  <div className="text-3xl font-black text-blue-400">
                    {new Intl.NumberFormat('ru-RU').format(results[results.length - 1].single)} ₽
                  </div>
                </div>
              </div>

              <div className="bg-emerald-950 text-white p-6 rounded-[2rem] shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Repeat size={80} />
                </div>
                <div className="relative z-10">
                  <div className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1">Итоговый капитал (Лестница)</div>
                  <div className="text-3xl font-black text-emerald-400">
                    {new Intl.NumberFormat('ru-RU').format(results[results.length - 1].monthly)} ₽
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;