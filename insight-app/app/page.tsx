'use client';

import { useRouter } from 'next/navigation';
import { Newspaper, TrendingUp } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">경제 인사이트</h1>
          <p className="mt-2 text-slate-500 font-medium">어려운 경제, 당신만의 시선으로</p>
        </header>

        {/* 메인 네비게이션 버튼 (Wi / Si) */}
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => router.push('/wi')}
            className="group flex items-center p-6 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:border-blue-200 transition-all text-left"
          >
            <div className="bg-blue-100 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600 mr-5">
              <Newspaper size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Would issue (Wi)</h3>
              <p className="text-slate-500 text-sm mt-1">국내외 주요 언론사 뉴스 모아보기</p>
            </div>
          </button>

          <button 
            onClick={() => router.push('/si')}
            className="group flex items-center p-6 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:border-blue-200 transition-all text-left"
          >
            <div className="bg-indigo-100 p-4 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600 mr-5">
              <TrendingUp size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Stock issue (Si)</h3>
              <p className="text-slate-500 text-sm mt-1">기업 펀더멘털 및 쉬운 동향 분석</p>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}
