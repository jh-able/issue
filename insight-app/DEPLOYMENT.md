# Vercel 배포 가이드

## 🚀 빠른 배포 (3분)

### 1단계: Vercel 계정 생성
1. [Vercel](https://vercel.com) 방문
2. GitHub 계정으로 로그인
3. 또는 이메일로 회원가입

### 2단계: 프로젝트 배포
1. Vercel 대시보드에서 **"새 프로젝트"** 클릭
2. GitHub 저장소 선택 (`jh-able/issue`)
3. **프레임워크**: Next.js (자동 감지됨)
4. **루트 디렉토리**: `insight-app` 설정
5. **배포** 클릭

### 3단계: 환경 변수 설정
배포 중 또는 후에 다음 환경 변수를 추가:

```
GEMINI_API_KEY=your_api_key_here (선택사항)
```

> 참고: 현재 API 라우트는 Google News RSS(무인증)를 사용하므로 필수 아님

### 4단계: 자동 배포 활성화
- 메인 브랜치에 Push 시 자동 배포
- PR을 열면 미리보기 배포 생성

---

## 📋 배포 확인

배포 후 다음 URL로 접속:
```
https://your-app.vercel.app
```

### 기본 라우트
- `/` - 홈 페이지
- `/wi` - 뉴스 (Wi - Would Issue)
- `/si` - 종목 분석 (Si - Stock Issue)

---

## 🔄 로컬 프로덕션 빌드 테스트

배포 전에 로컬에서 테스트하려면:

```bash
cd insight-app
npm run build
npm run start
```

---

## 💡 문제 해결

### 빌드 실패
- `next.config.ts` 확인
- `package.json` 의존성 확인
- 콘솔 로그에서 오류 메시지 확인

### API 라우트 오류
- Vercel은 서버리스 함수로 API 라우트 자동 변환
- `/api/news` → 자동 배포됨
- `/api/analyze` → 자동 배포됨

### 환경 변수 누락
- Vercel 프로젝트 설정 → 환경 변수
- 필요한 변수 추가 후 재배포

---

## 📊 배포 후 모니터링

Vercel 대시보드에서 확인:
- 📈 트래픽 분석
- 🔄 배포 이력
- ⚡ 성능 지표
- 🐛 에러 로그

---

## 🛠️ 수동 배포 (CLI)

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 배포
cd insight-app
vercel

# 프로덕션 배포
vercel --prod
```

---

## 💰 비용

**완전 무료** 🎉
- 무제한 배포
- 무제한 방문자
- 자동 SSL
- 글로벌 CDN

---

더 궁금한 점은 [Vercel 문서](https://vercel.com/docs)를 참고하세요.
