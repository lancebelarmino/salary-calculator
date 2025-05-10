'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BudgetItem, Calculator } from '@/components/calculator';
import { Breakdown } from '@/components/breakdown';

export interface Breakdown {
  hourlyRate: string;
  month: number;
  budgetItems: BudgetItem[];
}

export default function Home() {
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [tab, setTab] = useState('calculator');

  const initialRender = useRef(true);

  const updateBreakdown = (hourlyRate: string, month: number, budgetItems: BudgetItem[]) => {
    setBreakdown({
      hourlyRate,
      month,
      budgetItems
    });
    setTab('breakdown');
    localStorage.setItem('breakdown', JSON.stringify({ hourlyRate, month, budgetItems }));
    localStorage.setItem('tab', JSON.stringify('breakdown'));
  };

  useEffect(() => {
    if (initialRender.current) {
      const breakdown = JSON.parse(localStorage.getItem('breakdown') || '{}');
      setBreakdown(breakdown);

      const tab = JSON.parse(localStorage.getItem('tab') || 'calculator');
      setTab(tab);

      initialRender.current = false;
    }
  }, []);

  return (
    <div className="grid place-items-center rounded-md pt-[4%] pb-6">
      <div>
        {!initialRender.current && (
          <Tabs className="items-center gap-10" defaultValue="calculator" value={tab} onValueChange={setTab}>
            <TabsList className="grid w-[280px] grid-cols-2">
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            </TabsList>
            <TabsContent className="w-[600px]" value="calculator">
              <Calculator onBreakdownUpdate={updateBreakdown} />
            </TabsContent>
            <TabsContent className="w-[600px]" value="breakdown">
              <Breakdown breakdown={breakdown} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
