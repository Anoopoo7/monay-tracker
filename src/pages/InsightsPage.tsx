import React from 'react';
import { useMoneyFlow } from '../context/MoneyFlowContext';
import { usePrivacy } from '../context/PrivacyContext';
import {
  getCategorySpent,
  getSourceBalance,
  getTotalBudget,
  getTotalSpent,
  getActiveCategoryCount,
  getCompletedCategoryCount,
} from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { ArrowLeft, CheckCircle2, PieChart, BarChart3, Wallet, AlertTriangle, Layers } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface InsightsPageProps {
  onNavigateBack: () => void;
}

const COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1', // indigo
];

export const InsightsPage: React.FC<InsightsPageProps> = ({ onNavigateBack }) => {
  const { categories, sources, spends, transfers } = useMoneyFlow();
  const { isBalanceVisible } = usePrivacy();

  const totalBudget = getTotalBudget(categories);
  const totalSpent = getTotalSpent(spends);
  const remainingBudget = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = remainingBudget < 0;

  const activeCount = getActiveCategoryCount(categories);
  const completedCount = getCompletedCategoryCount(categories);
  const totalJobsCount = categories.length;

  // Data for Budget vs Spent chart (all categories, including completed)
  const budgetVsSpentData = categories.map((cat) => {
    const spent = getCategorySpent(cat.id, spends);
    return {
      name: cat.name,
      displayName: cat.isCompleted ? `${cat.name} ✓` : cat.name,
      budget: cat.budget || 0,
      spent: spent,
      isCompleted: cat.isCompleted,
    };
  });

  // Data for Spending by Job (only categories with spent > 0)
  const spendingByJobData = categories
    .map((cat, idx) => {
      const spent = getCategorySpent(cat.id, spends);
      return {
        name: cat.name,
        value: spent,
        isCompleted: cat.isCompleted,
        color: COLORS[idx % COLORS.length],
      };
    })
    .filter((item) => item.value > 0);

  // Data for Money by Source (transfer-aware source balances)
  const moneyBySourceData = sources.map((source, idx) => {
    const balance = getSourceBalance(source, spends, transfers);
    return {
      name: source.name,
      balance: balance,
      color: COLORS[idx % COLORS.length],
    };
  });

  const maskValue = (amount: number) => {
    return isBalanceVisible ? formatCurrency(amount) : '₹••••••';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header with Back Navigation */}
      <div className="flex items-center space-x-3 pt-1">
        <button
          onClick={onNavigateBack}
          className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95 transition"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Dashboard
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight">Insights & Progress</h1>
        </div>
      </div>

      {/* 1. OVERALL PROGRESS CARD */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overall Construction Progress
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isOverBudget
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
          >
            {percentageUsed.toFixed(1)}%
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-4 text-slate-400 text-sm">
            No jobs yet. Add a construction job to start tracking progress.
          </div>
        ) : (
          <>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {maskValue(totalSpent)}{' '}
                <span className="text-sm font-normal text-slate-400">
                  spent of {maskValue(totalBudget)} budget
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {isOverBudget ? (
                  <span className="text-rose-400 font-semibold flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                    Exceeded budget by {maskValue(Math.abs(remainingBudget))}
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">
                    Remaining budget: {maskValue(remainingBudget)}
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${isOverBudget
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                    : percentageUsed >= 80
                      ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* 2. BUDGET VS SPENT CHART */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Budget vs Spent by Job
          </h2>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            No construction jobs created yet.
          </div>
        ) : (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={budgetVsSpentData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <XAxis
                  dataKey="displayName"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => (isBalanceVisible ? `₹${val / 1000}k` : '•••')}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white flex items-center space-x-1">
                            <span>{data.name}</span>
                            {data.isCompleted && (
                              <span className="text-emerald-400 text-[10px] ml-1">✓ Completed</span>
                            )}
                          </p>
                          <p className="text-blue-400">Budget: {maskValue(data.budget)}</p>
                          <p className="text-emerald-400">Spent: {maskValue(data.spent)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                  formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
                />
                <Bar dataKey="budget" name="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Spent" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 3. SPENDING BY JOB (DONUT CHART) */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <PieChart className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Spending Distribution
          </h2>
        </div>

        {spendingByJobData.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <PieChart className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-300">No spending yet</div>
            <div className="text-xs text-slate-500 max-w-[240px] mx-auto">
              Add your first spend to see category spending distribution.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={spendingByJobData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {spendingByJobData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl shadow-xl text-xs">
                            <p className="font-bold text-white">{data.name}</p>
                            <p className="text-emerald-400 font-semibold mt-0.5">
                              {maskValue(data.value)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown List */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              {spendingByJobData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-200">
                      {item.name} {item.isCompleted && <span className="text-emerald-400">✓</span>}
                    </span>
                  </div>
                  <span className="font-bold text-white">{maskValue(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. MONEY BY SOURCE CHART */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Money Available by Source
          </h2>
        </div>

        {sources.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">No money sources yet.</div>
        ) : (
          <div className="space-y-3">
            {moneyBySourceData.map((src) => {
              const totalMoneyInSources = moneyBySourceData.reduce(
                (sum, s) => sum + Math.max(0, s.balance),
                0
              );
              const sourcePct =
                totalMoneyInSources > 0 ? (Math.max(0, src.balance) / totalMoneyInSources) * 100 : 0;

              return (
                <div key={src.name} className="p-3 bg-slate-800/60 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: src.color }}
                      />
                      <span className="font-semibold text-white">{src.name}</span>
                    </div>
                    <span className="font-bold text-emerald-400">{maskValue(src.balance)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(Math.max(0, sourcePct), 100)}%`,
                        backgroundColor: src.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. JOB STATUS SUMMARY */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Job Status</h2>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <div className="text-lg font-bold text-white">{totalJobsCount}</div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">Total Jobs</div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
            <div className="text-lg font-bold text-emerald-400 flex items-center justify-center space-x-1">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              <span>{completedCount}</span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-300 mt-0.5">Completed</div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/30">
            <div className="text-lg font-bold text-blue-400">{activeCount}</div>
            <div className="text-[11px] font-semibold text-blue-300 mt-0.5">Active</div>
          </div>
        </div>
      </div>
    </div>
  );
};
