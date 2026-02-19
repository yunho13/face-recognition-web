# 개발 계획: 얼굴 인식 웹 대시보드 (Face Recognition Web Dashboard)

이 문서는 `PRD.md`를 기반으로 구체화된 개발 계획입니다.

## 🛠 기술 스택 (Tech Stack)
- **Frontend**: React + Vite
- **Backend**: Python + FastAPI
- **AI/ML**: InsightFace (얼굴 분석/인식), OpenCV (이미지 처리)
- **Deployment**: Localhost (Web), GitHub (Version Control)

## 📅 마일스톤 및 세부 작업 (Milestones)

### Phase 1: 프로젝트 초기화 및 환경 구성 (Setup)
- [x] **Frontend 설정**: React + Vite 프로젝트 생성 및 기본 구조 잡기
- [x] **Backend 설정**: FastAPI 프로젝트 생성 및 가상환경(venv) 구성
- [x] **Dependency 설치**: 
    - Python: `insightface`, `onnxruntime` (GPU/CPU), `fastapi`, `uvicorn`, `opencv-python`, `python-multipart`
    - Node: `axios`, `react-webcam` (선택적)
- [x] **Git 초기화**: `.gitignore` 설정 (Python, Node용)

### Phase 2: 백엔드 코어 개발 (Backend - AI Engine)
PRD 핵심: *"기능이 돌아가게 만드는 핵심"*
- [x] **InsightFace 모델 연동**: 사전 학습된 모델 로드 및 추론 테스트
- [x] **얼굴 등록 API (`POST /register`) 구현**:
    - 이미지와 이름(Label)을 받아 임베딩 벡터 추출 및 저장
    - **[중요]** 한글 이름 깨짐 방지 처리 (UTF-8 인코딩/디코딩 신경 쓸 것)
    - 한 사람당 여러 장의 사진 등록이 가능하도록 데이터 구조 설계 (e.g., `Person -> [Vector1, Vector2, ...]`)
- [x] **얼굴 인식 API (`POST /recognize`) 구현**:
    - 이미지를 받아 등록된 임베딩과 코사인 유사도 비교
    - 가장 유사한 사람의 이름과 정확도(Score) 반환

### Phase 3: 프론트엔드 개발 (Frontend - Dashboard)
PRD 핵심: *"카메라 연동 및 시각화"*
- [x] **웹캠 연동**: 브라우저 `navigator.mediaDevices.getUserMedia` 사용하여 카메라 스트림 확보
- [x] **등록 UI 구현**:
    - 웹캠에서 사진 캡처 또는 파일 업로드
    - 이름 입력 폼 (한글 지원)
    - 백엔드로 전송
- [x] **실시간 인식 대시보드 구현**:
    - 일정 간격(e.g., 30fps 또는 사용자 설정)으로 프레임 캡처 후 백엔드 전송
    - 백엔드 응답(좌표, 이름)을 받아 캔버스(Canvas) 위에 바운딩 박스와 이름 오버레이

### Phase 4: 최적화 및 통합 (Integration & Polish)
- [ ] **성능 최적화**: 
    - Base64 인코딩 오버헤드 확인 및 Binary 전송 고려
    - 추론 속도 개선 (모델 사이즈 선택: Buffalo_l vs Buffalo_s)
- [ ] **예외 처리**: 얼굴이 감지되지 않았을 때, 등록되지 않은 사용자일 때 처리
- [ ] **문서화**: 사용법 및 실행 가이드 작성

## ✅ 핵심 요구사항 체크리스트 (from PRD)
- [ ] Camera 연동 (Frontend)
- [ ] Hugging Face / InsightFace 라이브러리 활용 (Backend)
- [ ] Python + FastAPI 기반 백엔드 구성
- [ ] React + Vite 기반 프론트엔드 구성
- [ ] 한글 이름 깨짐 문제 해결
- [ ] 한 사람당 2개 이상의 사진 등록 지원
