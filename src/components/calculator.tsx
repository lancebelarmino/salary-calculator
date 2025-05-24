'use client';

import React, { useState, SyntheticEvent, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface BudgetItem {
  id: string;
  name: string;
  percentage: number | string;
}

interface CalculatorProps {
  onBreakdownUpdate: (hourlyRate: string, month: number, budgetItems: BudgetItem[]) => void;
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

function getTotalPercentage(budgetItems: BudgetItem[]) {
  return budgetItems.reduce((acc, item) => acc + (item.percentage !== '' ? +item.percentage : 0), 0);
}

export function Calculator({ onBreakdownUpdate }: CalculatorProps) {
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([{ id: crypto.randomUUID(), name: '', percentage: '' }]);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const initialRender = useRef(true);

  const totalPercentage = getTotalPercentage(budgetItems);

  const handleAddBudgetItemClick = () => {
    setBudgetItems((prev) => [...prev, { id: crypto.randomUUID(), name: '', percentage: '' }]);
  };

  const handleBudgetItemChange = (id: string, name: string, value: string) => {
    setBudgetItems((prev) => prev.map((item) => (item.id === id ? { ...item, [name]: value } : item)));
  };

  const handleNextBtnClick = () => {
    setHasSubmitted(true);

    const totalPercentage = getTotalPercentage(budgetItems);
    if (totalPercentage !== 100) return;
    onBreakdownUpdate(hourlyRate, selectedMonth, budgetItems);
  };

  useEffect(() => {
    if (!initialRender.current) localStorage.setItem('hourlyRate', JSON.stringify(hourlyRate));
  }, [hourlyRate]);

  useEffect(() => {
    if (!initialRender.current) localStorage.setItem('selectedMonth', JSON.stringify(selectedMonth));
  }, [selectedMonth]);

  useEffect(() => {
    if (!initialRender.current) localStorage.setItem('budgetItems', JSON.stringify(budgetItems));
  }, [budgetItems]);

  useEffect(() => {
    if (initialRender.current) {
      const storedHourlyRate = localStorage.getItem('hourlyRate');
      if (storedHourlyRate) setHourlyRate(JSON.parse(storedHourlyRate));

      const storedSelectedMonth = localStorage.getItem('selectedMonth');
      if (storedSelectedMonth) setSelectedMonth(JSON.parse(storedSelectedMonth));

      const storedBudgetItems = localStorage.getItem('budgetItems');
      if (storedBudgetItems) setBudgetItems(JSON.parse(storedBudgetItems));

      initialRender.current = false;
    }
  }, []);

  return (
    <div className="rounded-md bg-white p-6">
      <h3 className="mb-6 text-orange-500">Calculate Budget</h3>

      <div className="pb-10">
        <h5 className="mb-2 font-medium">Salary</h5>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium">Hourly Rate (₱)</label>
            <Input
              className="w-full"
              type="number"
              value={hourlyRate}
              onChange={(e: SyntheticEvent<HTMLInputElement>) =>
                e.currentTarget.value === '' ? setHourlyRate('') : setHourlyRate(e.currentTarget.value)
              }
              placeholder="12"
            />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium">Month</label>
            <select
              className="w-full rounded border p-2"
              value={selectedMonth}
              onChange={(e: SyntheticEvent<HTMLSelectElement>) => setSelectedMonth(parseInt(e.currentTarget.value))}
            >
              {months.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex justify-between align-middle">
          <h5 className="font-medium">Budget Allocation</h5>
          <Button
            className="border-orange-200 hover:cursor-pointer"
            variant="outline"
            onClick={handleAddBudgetItemClick}
          >
            <Plus className="text-orange-500" />
          </Button>
        </div>

        <div className="pb-4">
          {budgetItems.map((item) => (
            <div key={item.id} className="group relative flex gap-4 pb-2">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">Name</label>
                <Input
                  className="w-full"
                  type="text"
                  min="0"
                  max="100"
                  placeholder="Fun"
                  value={item.name}
                  onChange={(e) => handleBudgetItemChange(item.id, 'name', e.target.value)}
                />
              </div>

              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">Percentage</label>
                <Input
                  className="w-full"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="20"
                  value={item.percentage}
                  onChange={(e) => handleBudgetItemChange(item.id, 'percentage', e.target.value)}
                />
              </div>

              <div
                className="absolute top-1/2 right-[-18px] cursor-pointer opacity-0 group-hover:opacity-100"
                onClick={() => setBudgetItems((prev) => prev.filter((budget) => budget.id !== item.id))}
              >
                <X className="text-red-500" size={16} />
              </div>
            </div>
          ))}
        </div>

        {hasSubmitted && (
          <div className="mt-2 flex items-center justify-between">
            {totalPercentage !== 100 && <div className="text-sm text-red-500">Percentages must add up to 100%</div>}
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleNextBtnClick}>Next</Button>
        </div>
      </div>
    </div>
  );
}
