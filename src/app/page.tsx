'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [hourlyRate, setHourlyRate] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const [necessitiesPercent, setNecessitiesPercent] = useState(40);
  const [investmentPercent, setInvestmentPercent] = useState(40);
  const [funPercent, setFunPercent] = useState(20);

  const totalPercent = necessitiesPercent + investmentPercent + funPercent;
  const isValidPercent = totalPercent === 100;

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

  const currentYear = new Date().getFullYear();

  const payPeriods = useMemo(() => {
    const firstPeriodStart = new Date(currentYear, selectedMonth - 1, 26);
    const firstPeriodEnd = new Date(currentYear, selectedMonth, 10);

    const secondPeriodStart = new Date(currentYear, selectedMonth, 11);
    const secondPeriodEnd = new Date(currentYear, selectedMonth, 25);

    return {
      firstPeriod: {
        start: firstPeriodStart,
        end: firstPeriodEnd
      },
      secondPeriod: {
        start: secondPeriodStart,
        end: secondPeriodEnd
      }
    };
  }, [selectedMonth, currentYear]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const countWeekdays = (startDate: Date, endDate: Date) => {
    const currentDate = new Date(startDate);

    let count = 0;

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
  };

  const firstPeriodDays = countWeekdays(payPeriods.firstPeriod.start, payPeriods.firstPeriod.end);
  const secondPeriodDays = countWeekdays(payPeriods.secondPeriod.start, payPeriods.secondPeriod.end);

  const firstPeriodSalary = parseFloat(String(hourlyRate)) * 8 * firstPeriodDays;
  const secondPeriodSalary = parseFloat(String(hourlyRate)) * 8 * secondPeriodDays;
  const totalSalary = firstPeriodSalary + secondPeriodSalary;

  const necessities = totalSalary * (necessitiesPercent / 100);
  const investment = totalSalary * (investmentPercent / 100);
  const fun = totalSalary * (funPercent / 100);

  const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('hourlyRate', e.target.value);
    setHourlyRate(parseFloat(e.target.value) || 0);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handlePercentChange = (id: string, value: string, setter: (value: number) => void) => {
    const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
    localStorage.setItem(id, value);
    setter(numValue);
  };

  useEffect(() => {
    const hourlyRate = parseFloat(localStorage.getItem('hourlyRate') || '0');
    const necessitiesPercent = parseInt(localStorage.getItem('necessitiesPercent') || '40');
    const investmentPercent = parseInt(localStorage.getItem('investmentPercent') || '40');
    const funPercent = parseInt(localStorage.getItem('funPercent') || '20');

    setHourlyRate(hourlyRate);
    setNecessitiesPercent(necessitiesPercent);
    setInvestmentPercent(investmentPercent);
    setFunPercent(funPercent);
  }, []);

  return (
    <div className="flex justify-center pt-16">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Salary Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Hourly Rate (₱)</label>
              <Input
                type="number"
                value={hourlyRate}
                onChange={handleHourlyRateChange}
                placeholder="Enter hourly rate"
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Month</label>
              <select className="w-full rounded border p-2" value={selectedMonth} onChange={handleMonthChange}>
                {months.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Budget Allocation (%)</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">Investment</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={investmentPercent}
                  onChange={(e) => handlePercentChange('investmentPercent', e.target.value, setInvestmentPercent)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">Necessities</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={necessitiesPercent}
                  onChange={(e) => handlePercentChange('necessitiesPercent', e.target.value, setNecessitiesPercent)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">Fun</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={funPercent}
                  onChange={(e) => handlePercentChange('funPercent', e.target.value, setFunPercent)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                Total:{' '}
                <span className={totalPercent === 100 ? 'font-medium' : 'font-medium text-red-500'}>
                  {totalPercent}%
                </span>
              </div>
              {!isValidPercent && <div className="text-sm text-red-500">Percentages must add up to 100%</div>}
            </div>
          </div>

          {hourlyRate && (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-medium">Salary Breakdown</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">First Period:</span> {formatDate(payPeriods.firstPeriod.start)} -{' '}
                    {formatDate(payPeriods.firstPeriod.end)}
                    <br />({firstPeriodDays} working days):
                    <span className="ml-2 font-medium">₱{firstPeriodSalary.toFixed(2)}</span>
                  </p>
                  <p>
                    <span className="font-medium">Second Period:</span> {formatDate(payPeriods.secondPeriod.start)} -{' '}
                    {formatDate(payPeriods.secondPeriod.end)}
                    <br />({secondPeriodDays} working days):
                    <span className="ml-2 font-medium">₱{secondPeriodSalary.toFixed(2)}</span>
                  </p>
                  <p className="pt-2 text-lg font-medium">Total Monthly: ₱{totalSalary.toFixed(2)}</p>
                </div>
              </div>

              {isValidPercent && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-2 font-medium">Budget Allocation</h3>
                  <div className="space-y-2">
                    <p>
                      Necessities ({necessitiesPercent}%):
                      <span className="ml-2 font-medium">₱{necessities.toFixed(2)}</span>
                    </p>
                    <p>
                      Investment ({investmentPercent}%):
                      <span className="ml-2 font-medium">₱{investment.toFixed(2)}</span>
                    </p>
                    <p>
                      Fun ({funPercent}%):
                      <span className="ml-2 font-medium">₱{fun.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
