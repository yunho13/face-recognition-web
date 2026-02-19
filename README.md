# 얼굴 인식 웹 대시보드 (Face Recognition Web Dashboard)

이 프로젝트는 파이썬(Python)과 허깅페이스(Hugging Face) 모델을 사용하여 얼굴 인식 시스템을 구현하고 웹 대시보드를 제공합니다.

## 주요 기능
- 실시간 카메라 연동
- 머신러닝(ML) 모델을 이용한 얼굴 탐지 및 인식
- 모니터링을 위한 웹 기반 대시보드 제공

## 설치 및 실행 방법 (Setup)
1. 가상 환경 생성: `python -m venv venv`
2. 가상 환경 활성화:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
3. 의존성 설치: `pip install -r requirements.txt`

## 실행 방법 (Run)

### Backend (API Server)
FastAPI 기반의 백엔드 서버를 실행합니다.

1. `src/ml` 디렉토리로 이동:
   ```bash
   cd src/ml
   ```
2. 서버 실행:
   ```bash
   python main.py
   # 또는
   uvicorn main:app --reload
   ```
- 서버는 `http://localhost:8000`에서 실행됩니다.
- API 문서(Swagger UI)는 `http://localhost:8000/docs`에서 확인할 수 있습니다.

### Frontend (Web Dashboard)
React + Vite 기반의 웹 대시보드를 실행합니다.

1. `src/web` 디렉토리로 이동:
   ```bash
   cd src/web
   ```
2. 패키지 설치 (최초 1회):
   ```bash
   npm install
   ```
3. 개발 서버 실행:
   ```bash
   npm run dev
   ```
- 웹 대시보드는 터미널에 표시된 주소(기본: `http://localhost:5173`)로 접속하여 확인할 수 있습니다.
