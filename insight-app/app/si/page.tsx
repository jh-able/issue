'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Home, Newspaper, ExternalLink, Trash2 } from 'lucide-react';

interface NewsArticle {
  title: string;
  url: string;
  source: string;
}

interface AnalysisData {
  overview: string;
  factCheck: NewsArticle[];
  insight: string;
  source: string;
}

interface SearchHistory {
  id: number;
  keyword: string;
  time: string;
  data: AnalysisData;
}

export default function StockIssue() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 컴포넌트 마운트 시 로컬스토리지에서 기록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('si_history');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        // 데이터 형식 호환성 확인 (문자열 vs 객체)
        const validData = parsedData.filter((item: SearchHistory) => 
          typeof item.data === 'object' && item.data.factCheck && Array.isArray(item.data.factCheck)
        );
        setHistory(validData);
      } catch (error) {
        console.error('로컬스토리지 데이터 로드 실패:', error);
        setHistory([]);
      }
    }
  }, []);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setIsLoading(true);

    try {
      // 우리가 만든 API로 검색어(keyword)를 보냅니다.
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: searchInput }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      // AI가 분석해준 답변을 기록 객체에 담습니다.
      const newRecord: SearchHistory = {
        id: Date.now(),
        keyword: searchInput,
        time: new Date().toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        data: result.data // AI의 응답 데이터
      };

      const updatedHistory = [newRecord, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('si_history', JSON.stringify(updatedHistory));
      setSearchInput('');
      
    } catch (error: any) {
      alert(error.message || '검색 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = (id: number) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('si_history', JSON.stringify(updatedHistory));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-extrabold text-slate-900">종목 분석 (Si)</h1>

        {/* 네비게이션 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/')}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-slate-700 py-3 rounded-2xl hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            <Home size={18} />
            홈으로
          </button>
          <button
            onClick={() => router.push('/wi')}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 py-3 rounded-2xl hover:bg-blue-100 transition-colors font-medium text-sm"
          >
            <Newspaper size={18} />
            뉴스 (Wi)
          </button>
        </div>
        
        {/* 검색창 */}
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="기업명이나 티커를 입력하세요" 
            className="flex-1 bg-white border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-900 shadow-sm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-slate-800 transition-colors disabled:bg-slate-400"
          >
            <Search size={24} />
          </button>
        </div>

        {/* 누적된 검색 기록 */}
        <div className="space-y-4 pt-4">
          {history.length === 0 ? (
            <p className="text-center text-slate-400 py-10">검색 기록이 없습니다.</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100">
                {/* 종목명 & 검색시간 & 삭제 버튼 */}
                <div className="flex justify-between items-end border-b border-gray-100 pb-3 mb-4">
                  <h2 className="text-xl font-bold text-slate-900">{item.keyword}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 font-medium">{item.time} 검색됨</span>
                    <button
                      onClick={() => handleDeleteHistory(item.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-lg"
                      title="이 검색기록 삭제"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* 한 줄 평 */}
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">📰 관련 뉴스 기사</h3>
                  <div className="space-y-2">
                    {item.data.factCheck.length > 0 ? (
                      item.data.factCheck.map((article, idx) => (
                        <a
                          key={idx}
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-slate-50 hover:bg-blue-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all group"
                        >
                          <div className="flex items-start gap-2">
                            <ExternalLink size={16} className="text-blue-500 flex-shrink-0 mt-0.5 group-hover:text-blue-600" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {article.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">{article.source}</p>
                            </div>
                          </div>
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 italic">관련 뉴스를 찾을 수 없습니다.</p>
                    )}
                  </div>
                </div>

                {/* 출처 */}
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-slate-400 font-medium">
                    출처: <span className="text-slate-500">{item.data.source}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
