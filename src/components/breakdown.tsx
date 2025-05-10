import React, { useEffect, useState } from 'react';
import type { Breakdown } from '@/app/page';

interface BreakdownProps {
  breakdown: Breakdown | null;
}

interface Period {
  start: Date;
  end: Date;
}

interface PayPeriod {
  firstPeriod: Period;
  secondPeriod: Period;
}

interface Salary {
  firstPeriod: number;
  secondPeriod: number;
  total: number;
  net: number;
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

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function countWeekdays(startDate: Date, endDate: Date) {
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
}

function getPayPeriods(breakdown: Breakdown): PayPeriod {
  const currentYear = new Date().getFullYear();
  const selectedMonth = breakdown?.month || new Date().getMonth();

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
}

function getTax(totalSalary: number) {
  const compensationRange = [
    {
      range: [33333, 66666],
      base: 1875,
      marginalRate: 0.2
    },
    {
      range: [66667, 166666],
      base: 8451.8,
      marginalRate: 0.25
    }
  ];

  const range = compensationRange.find((item) => totalSalary >= item.range[0] && totalSalary <= item.range[1]);

  if (range) {
    const excess = totalSalary - range.range[0];
    const tax = range.base + excess * range.marginalRate;
    return tax;
  }
  return null;
}

export function Breakdown({ breakdown }: BreakdownProps) {
  const [salary, setSalary] = useState<Salary | null>(null);
  const [payPeriods, setPayPeriods] = useState<PayPeriod | null>(null);

  console.log('lb-breakdown', breakdown);

  useEffect(() => {
    if (breakdown) {
      const sss = 1750;
      const hdmf = 200;
      const philhealth = 1625;
      const firstPeriodAllowance = 1000;
      const secondPeriodAllowance = 1000;

      const payPeriods = getPayPeriods(breakdown);

      const firstPeriodDays = countWeekdays(payPeriods.firstPeriod.start, payPeriods.firstPeriod.end);
      const secondPeriodDays = countWeekdays(payPeriods.secondPeriod.start, payPeriods.secondPeriod.end);

      const firstPeriodSalary =
        parseFloat(String(breakdown.hourlyRate)) * 8 * firstPeriodDays + firstPeriodAllowance - sss;
      const secondPeriodSalary =
        parseFloat(String(breakdown.hourlyRate)) * 8 * secondPeriodDays + secondPeriodAllowance - (hdmf + philhealth);
      const totalSalary = firstPeriodSalary + secondPeriodSalary;

      const tax = getTax(totalSalary);

      setPayPeriods(payPeriods);
      setSalary({
        firstPeriod: firstPeriodSalary - (tax ?? 0),
        secondPeriod: secondPeriodSalary,
        total: totalSalary - (tax ?? 0),
        net: totalSalary + (firstPeriodAllowance + secondPeriodAllowance) - (sss + hdmf + philhealth + (tax ?? 0))
      });
    }
  }, [breakdown]);

  console.log('lb-breakdown', breakdown);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 rounded-md bg-white p-6">
        <p className="pb-6">Net Salary</p>
        <p className="pb-1 text-4xl font-medium">₱ {salary?.net.toLocaleString()}</p>
        {breakdown?.month && <p className="text-xs text-gray-500">Month of {months[breakdown?.month]}</p>}
      </div>
      <div className="rounded-md bg-white p-6">
        <p className="pb-6">First Period</p>
        <p className="pb-1 text-4xl font-medium">₱ {salary?.firstPeriod.toLocaleString()}</p>
        {payPeriods && (
          <p className="text-xs text-gray-500">
            {formatDate(payPeriods.firstPeriod.start)} - {formatDate(payPeriods.firstPeriod.end)}
          </p>
        )}
      </div>
      <div className="rounded-md bg-white p-6">
        <p className="pb-6">Second Period</p>
        <p className="pb-1 text-4xl font-medium">₱ {salary?.secondPeriod.toLocaleString()}</p>
        {payPeriods && (
          <p className="text-xs text-gray-500">
            {formatDate(payPeriods.secondPeriod.start)} - {formatDate(payPeriods.secondPeriod.end)}
          </p>
        )}
      </div>
      <div className="col-span-2 flex flex-col gap-6 rounded-md bg-white p-6">
        {breakdown &&
          breakdown.budgetItems.map((item) => (
            <div key={item.id} className="border-gray-200 not-last:border-b not-last:pb-4">
              <p className="pb-6">{item.name}</p>
              {salary && (
                <p className="pb-1 text-4xl font-medium">
                  ₱ {(salary?.net * (+item.percentage / 100)).toLocaleString()}
                </p>
              )}
              <p className="text-xs text-gray-500">{item.percentage}% Allocated</p>
            </div>
          ))}
      </div>
    </div>
  );
}
