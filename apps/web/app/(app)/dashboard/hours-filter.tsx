'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function HoursFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get('hours') ?? '24');

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const h = Number(value.replace(',', '.'));
    router.push(`/dashboard?hours=${h > 0 ? h : 24}`);
  }

  return (
    <form onSubmit={apply} className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Thời gian</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        inputMode="decimal"
        className="w-20 border rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-500">giờ</span>
      <button
        type="submit"
        className="px-3 py-1.5 rounded-lg text-sm bg-gray-900 text-white hover:bg-gray-700"
      >
        Áp dụng
      </button>
    </form>
  );
}
