'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ExternalLink, RefreshCw, Home, TrendingUp, ArrowUp } from 'lucide-react';

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  link: string;
  category: string;
}

export default function WouldIssue() {
  const router = useRouter();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 각 카테고리별 ref 생성
  const categories = ['경제', 'IT', '정치', '시사'];
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news');
      const result = await res.json();
      if (res.ok) setNewsList(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 카테고리로 스크롤 이동
  const scrollToCategory = (category: string) => {
    const element = categoryRefs.current[category];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* 네비게이션 헤더 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-slate-900">오늘의 이슈 (Wi)</h1>
          <button onClick={fetchNews} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

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
            onClick={() => router.push('/si')}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 py-3 rounded-2xl hover:bg-indigo-100 transition-colors font-medium text-sm"
          >
            <TrendingUp size={18} />
            종목 분석 (Si)
          </button>
        </div>

        {/* 카테고리 버튼 */}
        <div className="flex gap-2 flex-wrap justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => scrollToCategory(category)}
              className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full hover:bg-blue-100 transition-colors font-medium text-sm"
            >
              {category}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-medium">AI가 뉴스를 번역하고 요약 중입니다...</div>
        ) : (
          <div className="space-y-6">
            {/* 카테고리별 뉴스 */}
            {['경제', 'IT', '정치', '시사'].map((category) => {
              const categoryNews = newsList.filter(news => news.category === category);
              if (categoryNews.length === 0) return null;
              
              return (
                <div 
                  key={category}
                  ref={(el) => {
                    if (el) categoryRefs.current[category] = el;
                  }}
                >
                  <h2 className="text-lg font-bold text-slate-900 mb-3 px-1">{category}</h2>
                  <div className="space-y-3">
                    {categoryNews.map((news, idx) => (
                      <div key={idx} className="bg-white rounded-3xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 transition-all">
                        <div 
                          className="flex justify-between items-start cursor-pointer"
                          onClick={() => setExpandedId(expandedId === `${category}-${idx}` ? null : `${category}-${idx}`)}
                        >
                          <div className="flex-1 pr-4">
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                              {news.source}
                            </span>
                            <h2 className="text-lg font-bold text-slate-900 mt-2 leading-snug break-keep">
                              {news.title}
                            </h2>
                          </div>
                          <ChevronDown className={`text-gray-300 mt-1 transition-transform ${expandedId === `${category}-${idx}` ? 'rotate-180' : ''}`} />
                        </div>

                        {expandedId === `${category}-${idx}` && (
                          <div className="mt-4 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-slate-50 rounded-2xl p-4 text-slate-700 text-sm leading-relaxed whitespace-pre-line border border-slate-100">
                              {news.summary}
                            </div>
                            <a 
                              href={news.link} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="mt-4 inline-flex items-center text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              출처: {news.source} (기사 원문 보기) <ExternalLink size={12} className="ml-1" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 맨 위로 스크롤 버튼 */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all animation-pulse z-50"
          title="맨 위로"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}

