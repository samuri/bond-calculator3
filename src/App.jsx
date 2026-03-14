import React, { useState, useMemo } from 'react';
import './index.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Info, TrendingUp, Calendar, Wallet, Calculator, ArrowRightLeft, Percent, Repeat, Layers, Coins, CheckCircle2 } from 'lucide-react';

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

  // Расчеты
  const results = useMemo(() => {
    const data = [];
    let currentSinglePrincipal = principal;
    let singleCash = 0;
    let currentMonthlyPrincipal = principal;
    let monthlyCash = 0;

    const netRateSingle = (yieldSingle / 100) * (1 - taxRate / 100);
    const netRateMonthly = (yieldMonthly / 100) * (1 - taxRate / 100);

    data.push({
      month: 0,
      single: Math.round(currentSinglePrincipal + singleCash),
      monthly: Math.round(currentMonthlyPrincipal + monthlyCash),
    });

    for (let m = 1; m <= years * 12; m++) {
      if (reinvest) {
        if (m % 6 === 0) {
          const coupon = currentSinglePrincipal * (netRateSingle / 2);
          const available = coupon + singleCash;
          if (useLotSize) {
            const bondsToBuy = Math.floor(available / bondPrice);
            currentSinglePrincipal += bondsToBuy * bondPrice;
            singleCash = available - (bondsToBuy * bondPrice);
          } else {
            currentSinglePrincipal += available;
            singleCash = 0;
          }
        }

        const monthlyCoupon = currentMonthlyPrincipal * (netRateMonthly / 12);
        const availableMonthly = monthlyCoupon + monthlyCash;
        if (useLotSize) {
          const bondsToBuy = Math.floor(availableMonthly / bondPrice);
          currentMonthlyPrincipal += bondsToBuy * bondPrice;
          monthlyCash = availableMonthly - (bondsToBuy * bondPrice);
        } else {
          currentMonthlyPrincipal += availableMonthly;
          monthlyCash = 0;
        }
      }

      if (m % 12 === 0 || m === years * 12) {
        data.push({
          month: m / 12,
          single: Math.round(currentSinglePrincipal + singleCash),
          monthly: Math.round(currentMonthlyPrincipal + monthlyCash),
        });
      }
    }
    return data;
  }, [principal, yieldSingle, yieldMonthly, bondPrice, years, taxRate, reinvest, useLotSize]);

  // Компонент для поля ввода с бегунком
  const InputGroup = ({ label, icon: Icon, value, onChange, min, max, step, suffix = "" }) => (
    <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <Icon size={18} className="text-blue-500" />
          <span>{label}</span>
        </div>
        <div className="relative">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-24 px-2 py-1 text-right font-bold text-blue-600 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="ml-1 text-slate-400 text-sm">{suffix}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-3">
            <Layers className="text-blue-600" /> Сравнение ОФЗ 2.3
          </h1>
          <p className="text-slate-500 font-medium">Интерактивный анализ стратегий реинвестирования</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Панель настроек */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-fit space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 pb-2 border-b">
              <Calculator size={20} className="text-blue-600" /> Настройки
            </h2>

            <InputGroup 
              label="Стартовый капитал" icon={Wallet} 
              value={principal} onChange={setPrincipal} 
              min={10000} max={10000000} step={10000} suffix="₽"
            />

            <InputGroup 
              label="Доходность (1 выпуск)" icon={Percent} 
              value={yieldSingle} onChange={setYieldSingle} 
              min={0} max={30} step={0.1} suffix="%"
            />

            <InputGroup 
              label="Доходность (Лестница)" icon={TrendingUp} 
              value={yieldMonthly} onChange={setYieldMonthly} 
              min={0} max={30} step={0.1} suffix="%"
            />

            <InputGroup 
              label="Срок инвестиций" icon={Calendar} 
              value={years} onChange={setYears} 
              min={1} max={30} step={1} suffix="лет"
            />

            <div className="space-y-4 pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <input type="checkbox" checked={reinvest} onChange={(e) => setReinvest(e.target.checked)} className="w-5 h-5 accent-blue-600" />
                <span className="text-sm font-semibold">Реинвестировать купоны</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <input type="checkbox" checked={useLotSize} onChange={(e) => setUseLotSize(e.target.checked)} className="w-5 h-5 accent-blue-600" />
                <span className="text-sm font-semibold">Учитывать цену облигации ({bondPrice}₽)</span>
              </label>
            </div>
          </div>

          {/* Визуализация */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="text-green-500" /> Прогноз роста капитала
              </h2>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" label={{ value: 'Годы', position: 'bottom', offset: 0 }} />
                    <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                    <Tooltip 
                      formatter={(val) => new Intl.NumberFormat('ru-RU').format(val) + ' ₽'}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Line name="Один выпуск" type="monotone" dataKey="single" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    <Line name="Лестница" type="monotone" dataKey="monthly" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Итоговая таблица */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg">
                <div className="flex items-center gap-2 mb-2 opacity-80"><Coins size={20}/> Итог: Один выпуск</div>
                <div className="text-3xl font-black">
                  {new Intl.NumberFormat('ru-RU').format(results[results.length - 1].single)} ₽
                </div>
              </div>
              <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg">
                <div className="flex items-center gap-2 mb-2 opacity-80"><Repeat size={20}/> Итог: Лестница</div>
                <div className="text-3xl font-black">
                  {new Intl.NumberFormat('ru-RU').format(results[results.length - 1].monthly)} ₽
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