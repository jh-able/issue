import { NextResponse } from 'next/server';
import translate from 'google-translate-api-x';

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  link: string;
  category: string;
}

// 허용된 언론사 목록
const ALLOWED_SOURCES = [
  'The New York Times',
  'BBC News',
  'BBC',
  'KBS',
  'SBS',
  'France24',
  'France 24',
  'CNN International',
  'CNN',
  'The Guardian',
  '매일경제',
  '한국경제',
  '머니투데이'
];

function isAllowedSource(source: string): boolean {
  return ALLOWED_SOURCES.some(allowed => 
    source.toLowerCase().includes(allowed.toLowerCase())
  );
}

// 한글 요약 생성 함수
function generateKoreanSummary(title: string, source: string, category: string): string {
  const categoryLabel = {
    '경제': '경제 뉴스',
    'IT': '기술 뉴스',
    '정치': '정치 뉴스',
    '시사': '시사 뉴스'
  }[category] || '뉴스';

  // 제목을 기반으로 간단한 요약 생성 (2~3줄)
  const lines = [
    `【${categoryLabel}】`,
    title,
    ``,
    `출처: ${source}`
  ];

  return lines.join('\n');
}

export async function GET() {
  try {
    // 언론사별 카테고리 매핑
    const sourceCategories: { [key: string]: string } = {
      'The New York Times': '경제',
      'BBC': '정치',
      'KBS': '시사',
      'SBS': '경제',
      'France24': '정치',
      'CNN': 'IT',
      'The Guardian': '시사',
      '매일경제': '경제',
      '한국경제': '경제',
      '머니투데이': '경제'
    };

    // 검색 쿼리: 각 언론사의 뉴스 검색 + 카테고리별 검색
    const searchQueries: { source?: string; keywords: string; category: string }[] = [];
    
    // 각 언론사별 검색
    for (const [source, category] of Object.entries(sourceCategories)) {
      searchQueries.push({
        source,
        keywords: source,
        category
      });
    }
    
    // 추가 카테고리별 검색 (더 많은 뉴스 확보)
    searchQueries.push(
      { keywords: 'economy finance', category: '경제' },
      { keywords: 'technology AI', category: 'IT' },
      { keywords: 'politics government', category: '정치' },
      { keywords: 'world news', category: '시사' }
    );

    const allNews: NewsItem[] = [];
    const seenLinks = new Set<string>(); // 중복 제거용

    // 각 검색 쿼리별로 Google News RSS에서 뉴스 가져오기
    for (const { source, keywords, category } of searchQueries) {
      try {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keywords)}`;
        const response = await fetch(rssUrl);
        const data = await response.text();

        // XML에서 뉴스 추출
        const items = data.match(/<item>([\s\S]*?)<\/item>/g) || [];
        
        for (const item of items) {
          const title = item.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/<[^>]*>/g, '') || '';
          const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '#';
          const newsSource = item.match(/<source[^>]*url="(.*?)"[^>]*>(.*?)<\/source>/)?.[2]?.replace(/<[^>]*>/g, '') || '뉴스';
          
          // 이미 추가된 뉴스인지 확인
          if (seenLinks.has(link)) continue;
          
          // 특정 언론사 검색인 경우 해당 언론사만 허용, 아니면 전체 허용된 언론사 필터링
          if (source) {
            if (!newsSource.toLowerCase().includes(source.toLowerCase())) continue;
          } else {
            if (!isAllowedSource(newsSource)) continue;
          }

          seenLinks.add(link);
          
          allNews.push({
            title,
            summary: '', // 나중에 번역 후 업데이트
            source: newsSource,
            link,
            category
          });

          // 같은 언론사 검색이면 1개만, 아니면 적절한 개수 확보
          if (source) break;
        }
      } catch (error) {
        console.log(`검색 실패: ${keywords}`, error);
      }
    }

    // 카테고리별로 최대 3-4개씩만 남기기
    const categoryLimits: { [key: string]: number } = {
      '경제': 4,
      'IT': 3,
      '정치': 3,
      '시사': 3
    };

    const tempNews: NewsItem[] = [];
    const categoryCounts: { [key: string]: number } = {};

    for (const news of allNews) {
      if (!categoryCounts[news.category]) {
        categoryCounts[news.category] = 0;
      }
      
      if (categoryCounts[news.category] < (categoryLimits[news.category] || 3)) {
        tempNews.push(news);
        categoryCounts[news.category]++;
      }
    }

    // 모든 뉴스 제목을 한글로 번역
    const finalNews: NewsItem[] = [];
    
    for (const news of tempNews) {
      try {
        // 제목이 이미 한글인 경우 번역하지 않음
        const isKorean = /[가-힣]/.test(news.title);
        let koreanTitle = news.title;
        
        if (!isKorean) {
          // 영문 제목을 한글로 번역
          const result = await translate(news.title, { to: 'ko' });
          koreanTitle = result.text;
        }
        
        // 한글 제목과 출처 정보로 요약 생성 (2~4줄)
        const koreanSummary = generateKoreanSummary(koreanTitle, news.source, news.category);
        
        finalNews.push({
          title: koreanTitle,
          summary: koreanSummary,
          source: news.source,
          link: news.link,
          category: news.category
        });
      } catch (error) {
        console.log(`번역 실패: ${news.title}`, error);
        // 번역 실패 시 원본 제목 사용
        finalNews.push(news);
      }
    }

    // 최종 정렬: 카테고리별로 정렬
    finalNews.sort((a, b) => {
      const categoryOrder = ['경제', 'IT', '정치', '시사'];
      return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    });

    // 뉴스가 없으면 fallback 데이터 사용
    if (finalNews.length === 0) {
      return NextResponse.json({
        data: [
          {
            title: "뉴스를 불러올 수 없습니다",
            summary: "현재 뉴스 연결에 문제가 있습니다.",
            source: "시스템",
            link: "#",
            category: "경제"
          }
        ]
      }, { status: 200 });
    }

    return NextResponse.json({ data: finalNews }, { status: 200 });
  } catch (error) {
    console.error('News API Error:', error);
    return NextResponse.json({ error: '뉴스를 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
