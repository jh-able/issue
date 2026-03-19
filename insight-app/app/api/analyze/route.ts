interface NewsArticle {
  title: string;
  url: string;
  source: string;
}

import { NextResponse } from 'next/server';
import translate from 'google-translate-api-x';

// 경제 신문사 목록
const ECONOMIC_SOURCES = [
  '매일경제',
  '한국경제',
  '머니투데이',
  'The New York Times',
  'BBC',
  'CNN',
  'The Guardian',
  'SBS',
  'France24',
  'France 24',
  'KBS',
  'Reuters',
  'Bloomberg',
  'Financial Times',
  '조선일보',
  '중앙일보',
  '동아일보',
  '경향신문'
];

function isEconomicSource(source: string): boolean {
  return ECONOMIC_SOURCES.some(eSource =>
    source.toLowerCase().includes(eSource.toLowerCase())
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword } = body;

    if (!keyword) {
      return NextResponse.json(
        { error: '검색할 기업명이나 티커를 입력해주세요.' },
        { status: 400 }
      );
    }

    let articles: NewsArticle[] = [];
    
    try {
      // 다양한 검색 쿼리 시도
      const searchQueries = [
        `${keyword} economy finance`,
        `${keyword} stock market`,
        `${keyword} business news`,
        keyword // 기본 검색
      ];

      for (const query of searchQueries) {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}`;
        
        try {
          const newsResponse = await fetch(rssUrl);
          const newsData = await newsResponse.text();

          // XML에서 뉴스 제목, URL, 출처 추출
          const newsItems = newsData.match(/<item>([\s\S]*?)<\/item>/g) || [];
          
          // 모든 뉴스를 처리하되, 경제 신문사만 필터링
          const allArticles = newsItems.map(item => {
            const title = item.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/<[^>]*>/g, '') || '';
            const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '#';
            const source = item.match(/<source[^>]*url="(.*?)"[^>]*>(.*?)<\/source>/)?.[2]?.replace(/<[^>]*>/g, '') || '뉴스';
            return { title, url: link, source };
          });

          // 경제 신문사 필터링
          const economicArticles = allArticles.filter(article => isEconomicSource(article.source));
          articles.push(...economicArticles);

          // 충분한 기사를 찾았으면 중단
          if (articles.length >= 5) {
            articles = articles.slice(0, 5);
            break;
          }
        } catch (error) {
          console.log(`검색 실패: ${query}`);
          continue;
        }
      }

    } catch (error) {
      console.log('뉴스 가져오기 실패, 빈 배열로 진행');
    }

    // 기사 제목을 한글로 번역
    const translatedArticles: NewsArticle[] = [];
    
    for (const article of articles) {
      try {
        // 제목이 이미 한글인 경우 번역하지 않음
        const isKorean = /[가-힣]/.test(article.title);
        let koreanTitle = article.title;
        
        if (!isKorean) {
          // 영문 제목을 한글로 번역 (최대 2회 재시도)
          let translated = false;
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              const result = await translate(article.title, { to: 'ko' });
              koreanTitle = result.text;
              translated = true;
              break;
            } catch (error) {
              if (attempt === 0) {
                // 첫 시도 실패 시 대기 후 재시도
                await new Promise(resolve => setTimeout(resolve, 100));
                continue;
              }
            }
          }
          
          // 번역 실패 시 로그
          if (!translated) {
            console.log(`번역 실패: ${article.title}`);
          }
        }
        
        translatedArticles.push({
          title: koreanTitle,
          url: article.url,
          source: article.source
        });
      } catch (error) {
        console.log(`기사 처리 오류: ${article.title}`, error);
        // 오류 시 원본 제목 사용
        translatedArticles.push(article);
      }
    }

    // 팩트체크에 실제 뉴스 기사만 포함
    const analysis = {
      overview: '',
      factCheck: translatedArticles.length > 0 ? translatedArticles : [
        { title: '최근 경제 관련 뉴스를 찾을 수 없습니다.', url: '#', source: '미정' }
      ],
      insight: '',
      source: `Google News · ${keyword} 실시간 경제 뉴스`
    };

    return NextResponse.json({ data: analysis }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '데이터를 분석하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
