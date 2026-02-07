# 마일스톤 정의 (라벨 사용 또는 실제 마일스톤 기능 사용 가능, 여기서는 라벨로 구분)
$milestones = @(
    @{ Name = "Milestone 1"; Description = "프로젝트 설정 및 조사"; Color = "ededed" },
    @{ Name = "Milestone 2"; Description = "핵심 ML 기능 구현"; Color = "c2e0c6" },
    @{ Name = "Milestone 3"; Description = "웹 대시보드 개발"; Color = "bfd4f2" },
    @{ Name = "Milestone 4"; Description = "배포 및 문서화"; Color = "f9d0c4" }
)

# 라벨 생성
foreach ($m in $milestones) {
    gh label create $m.Name --description $m.Description --color $m.Color --force
}

# 이슈 목록 (한글)
$issues = @(
    @{ Title = "Hugging Face 모델 조사"; Body = "얼굴 탐지 및 인식을 위한 적절한 모델 조사 및 선정"; Label = "Milestone 1" },
    @{ Title = "Python 개발 환경 설정"; Body = "가상 환경(venv) 설정 및 필수 라이브러리 설치"; Label = "Milestone 1" },
    @{ Title = "카메라 영상 캡처 구현"; Body = "OpenCV를 사용하여 웹캠 비디오 피드 캡처 기능 구현"; Label = "Milestone 2" },
    @{ Title = "Hugging Face 모델 연동"; Body = "선정된 모델을 로드하고 얼굴 탐지 기능 연동"; Label = "Milestone 2" },
    @{ Title = "얼굴 인식 로직 구현"; Body = "탐지된 얼굴을 식별하는 로직 구현"; Label = "Milestone 2" },
    @{ Title = "대시보드 레이아웃 설계"; Body = "웹 대시보드 화면 구성 및 디자인"; Label = "Milestone 3" },
    @{ Title = "웹 백엔드 API 개발"; Body = "영상 스트리밍 및 제어를 위한 백엔드(Flask/FastAPI) 구현"; Label = "Milestone 3" },
    @{ Title = "웹 프론트엔드 개발"; Body = "실시간 영상과 인식 결과를 표시하는 웹 화면 개발"; Label = "Milestone 3" },
    @{ Title = "문서화 작업"; Body = "README 작성 및 사용법 가이드 업데이트"; Label = "Milestone 4" }
)

# 이슈 생성
foreach ($issue in $issues) {
    gh issue create --title $issue.Title --body $issue.Body --label $issue.Label
}
