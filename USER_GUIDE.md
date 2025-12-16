# MistSeeker Desktop 사용설명서

## 목차

1. [제품 소개](#제품-소개)
2. [시작하기](#시작하기)
3. [기본 사용법](#기본-사용법)
4. [결과 확인하기](#결과-확인하기)
5. [라이선스 관리](#라이선스-관리)
6. [설정](#설정)
7. [문제 해결](#문제-해결)
8. [FAQ](#faq)

---

## 제품 소개

### MistSeeker Desktop이란?

MistSeeker Desktop은 MistSeeker Docker 엔진을 사용하기 쉽게 만드는 데스크톱 애플리케이션입니다. 복잡한 Docker 명령어를 입력할 필요 없이 GUI를 통해 코드 분석을 실행할 수 있습니다.

**중요**: MistSeeker Desktop은 분석 엔진이 아닙니다. Docker 기반 MistSeeker 엔진을 실행하는 UX 레이어입니다. 모든 분석 로직은 Docker 컨테이너 내부에서 실행됩니다.

### 주요 기능

- **GUI 기반 분석**: 마우스 클릭만으로 코드 분석 실행
- **프로젝트 선택**: 폴더 선택, 드래그 앤 드롭, 코드 붙여넣기 지원
- **실시간 로그**: 분석 진행 상황을 실시간으로 확인
- **자동 결과 열기**: 분석 완료 시 결과 폴더 자동 열기
- **결과 공유**: ZIP 파일 생성으로 결과 공유
- **Free/Pro 모드**: 라이선스에 따른 기능 제공
- **사용자 친화적 경로**: 결과를 Documents 폴더에 자동 저장

### MistSeeker 엔진 기능

MistSeeker Desktop은 다음 기능을 제공하는 MistSeeker 엔진을 실행합니다:

- **COI (Code Organization Index)**: 코드 구조 및 기하적 안정성 분석
- **ORI (Operation Reliability Index)**: 실행 안정성 및 부수효과 분석
- **GSS (Geometric Stability Score)**: 기하적 안정성 분석 (선택적)
- **GSI (Global Stability Index)**: 전체 안정성 종합 점수
- **0~100 점수 및 Grade 시스템**: 직관적인 점수 표시
- **JSON/PDF 리포트**: 상세 분석 리포트 생성

### 지원 언어

MistSeeker는 다음 프로그래밍 언어를 지원합니다:

- Python (.py, .pyw, .pyi)
- JavaScript (.js, .jsx, .mjs, .cjs)
- TypeScript (.ts, .tsx)
- Java (.java)
- Go (.go)
- Rust (.rs)
- C/C++ (.c, .h, .cpp, .hpp, ...)
- Ruby (.rb, .rbw)
- PHP (.php, .php3, .php4, .php5, .phtml)
- C# (.cs)

---

## 시작하기

### 시스템 요구사항

- **운영체제**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)
- **Docker Desktop**: 설치 및 실행 중이어야 함
- **디스크 공간**: 최소 2GB (Docker 이미지 포함)

### 설치 방법

#### Windows

1. **Docker Desktop 설치**
   - [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop) 다운로드 및 설치
   - 설치 후 Docker Desktop 실행

2. **MistSeeker Desktop 설치**
   - 릴리스 페이지에서 `MistSeeker-Desktop-Setup.exe` 다운로드
   - 설치 파일 실행 및 안내에 따라 설치

#### macOS

1. **Docker Desktop 설치**
   - [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop) 다운로드 및 설치
   - 설치 후 Docker Desktop 실행

2. **MistSeeker Desktop 설치**
   - 릴리스 페이지에서 `MistSeeker-Desktop.dmg` 다운로드
   - DMG 파일 열기 및 Applications 폴더로 드래그

#### Linux

1. **Docker 설치**
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install docker.io
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

2. **MistSeeker Desktop 설치**
   - 릴리스 페이지에서 `MistSeeker-Desktop.AppImage` 다운로드
   - 실행 권한 부여:
     ```bash
     chmod +x MistSeeker-Desktop.AppImage
     ./MistSeeker-Desktop.AppImage
     ```

### 첫 실행

1. **MistSeeker Desktop 실행**
   - Windows: 시작 메뉴에서 "MistSeeker Desktop" 실행
   - macOS: Applications 폴더에서 실행
   - Linux: AppImage 더블클릭 또는 터미널에서 실행

2. **Docker 상태 확인**
   - 앱이 자동으로 Docker Desktop 상태를 확인합니다
   - Docker가 실행 중이면 초록색 "OK" 표시
   - Docker가 실행되지 않으면 경고 메시지 표시

3. **Docker Desktop 시작**
   - Docker가 실행되지 않은 경우 Docker Desktop을 시작하세요
   - 사이드바의 "Refresh" 버튼을 클릭하여 다시 확인

---

## 기본 사용법

### 1. 프로젝트 선택

#### 방법 1: 폴더 선택 (기본)

1. 메인 화면에서 "Select Folder" 버튼 클릭
2. 분석할 프로젝트 폴더 선택
3. 선택한 폴더 경로가 표시됩니다

#### 방법 2: 드래그 앤 드롭

1. 파일 탐색기에서 프로젝트 폴더를 찾습니다
2. 폴더를 MistSeeker Desktop 창으로 드래그 앤 드롭
3. 폴더가 자동으로 선택됩니다

#### 방법 3: 코드 붙여넣기

1. "Paste Code Instead" 버튼 클릭
2. 분석할 코드를 텍스트 영역에 붙여넣기
3. "Create Project & Scan" 버튼 클릭
4. 임시 프로젝트 폴더가 생성되고 분석이 시작됩니다

### 2. Docker 이미지 설정

- 기본값: `mistseeker/mistseeker:latest`
- 필요시 다른 이미지 이름으로 변경 가능
- 예: `tongro2025/mistseeker:latest`

### 3. 스캔 실행

1. 프로젝트 폴더가 선택되었는지 확인
2. Docker 상태가 "OK"인지 확인
3. "Run Scan" 버튼 클릭
4. 분석이 시작되며 실시간 로그가 표시됩니다

### 4. 진행 상황 확인

- **실시간 로그**: 분석 진행 상황이 실시간으로 표시됩니다
- **자동 스크롤**: 새 로그가 자동으로 표시됩니다
- **중지**: "Stop Scan" 버튼으로 분석을 중지할 수 있습니다

---

## 결과 확인하기

### 자동 결과 열기

분석이 완료되면 결과 폴더가 자동으로 열립니다.

**결과 저장 위치:**
- **Windows**: `Documents\MistSeeker Reports\<프로젝트명>\<타임스탬프>\`
- **macOS**: `~/Documents/MistSeeker Reports/<프로젝트명>/<타임스탬프>/`

**결과 파일:**
- `result.json`: JSON 형식의 상세 분석 리포트
- `report.pdf`: PDF 형식의 리포트 (Pro 모드)
- `run.log`: 실행 로그

### 결과 뷰어

분석 완료 후 결과 뷰어가 자동으로 표시됩니다.

#### Summary 탭

- **Total Issues**: 전체 이슈 개수
- **Critical Issues**: 심각한 이슈 개수
- **Warnings**: 경고 개수
- **Scanned Files**: 분석된 파일 개수
- **Scan Duration**: 분석 소요 시간

#### Full JSON 탭

- JSON 리포트 전체 내용을 보기 좋게 포맷하여 표시
- 복사하여 다른 도구에서 사용 가능

#### Run Log 탭

- Docker 컨테이너 실행 로그
- 오류 발생 시 디버깅에 유용

### 결과 공유

#### PDF 리포트 열기

1. "📄 Open PDF Report" 버튼 클릭
2. 시스템 기본 PDF 뷰어로 리포트가 열립니다

#### 출력 폴더 열기

1. "📂 Open Output Folder" 버튼 클릭
2. 결과가 저장된 폴더가 파일 탐색기에서 열립니다

#### ZIP 파일 생성

1. "📦 Create ZIP for Sharing" 버튼 클릭
2. 결과 폴더가 ZIP 파일로 압축됩니다
3. ZIP 파일 경로가 표시됩니다

---

## 라이선스 관리

### Free 모드 vs Pro 모드

#### Free 모드 (기본)

- **비용**: 무료
- **제공 기능**:
  - 기본 분석 결과 (COI/ORI/GSI 점수)
  - 프로젝트 요약 통계
  - JSON 리포트
- **제한 사항**:
  - 상세 이슈 정보 제한
  - PDF 리포트 제한

#### Pro 모드

- **비용**: 유료 (라이선스 키 필요)
- **제공 기능**:
  - Free 모드의 모든 기능
  - 상세 이슈 정보 (라인 단위)
  - 문제 구간(segments) 분석
  - PDF 리포트 생성
  - 고급 분석 기능

### 라이선스 등록

1. 사이드바의 "License" 패널 확인
2. "Register License" 버튼 클릭
3. 라이선스 키 입력
4. "Submit" 버튼 클릭
5. 등록 성공 시 "PRO MODE"로 변경됩니다

### 라이선스 파일

- 라이선스는 `license.json` 파일로 저장됩니다
- 파일 위치:
  - **Windows**: `%APPDATA%\mistseeker-desktop\license.json`
  - **macOS**: `~/Library/Application Support/mistseeker-desktop/license.json`
  - **Linux**: `~/.config/mistseeker-desktop/license.json`

**중요**: MistSeeker 엔진은 라이선스 키를 알지 못합니다. `license.json` 파일의 존재 여부만 확인합니다.

---

## 설정

### 출력 디렉토리 변경

1. 헤더의 "⚙️ Settings" 버튼 클릭
2. "Reports Output Directory" 섹션에서 "Browse" 버튼 클릭
3. 원하는 폴더 선택
4. "Save Settings" 버튼 클릭

### 기본값으로 복원

1. 설정 패널에서 "Reset to Default" 버튼 클릭
2. 출력 디렉토리가 Documents 폴더로 복원됩니다

---

## 문제 해결

### Docker가 감지되지 않음

**증상**: 사이드바에 "Docker Desktop is not running" 표시

**해결 방법**:
1. Docker Desktop이 설치되어 있는지 확인
2. Docker Desktop을 실행합니다
3. 시스템 트레이(Windows) 또는 메뉴 바(macOS)에서 Docker 아이콘 확인
4. MistSeeker Desktop의 "Refresh" 버튼 클릭

**Windows 특별 사항**:
- WSL 2 백엔드 사용 시 WSL 2가 설치되어 있어야 합니다
- Docker Desktop 설정에서 WSL 2 백엔드가 활성화되어 있는지 확인

### 분석이 시작되지 않음

**가능한 원인**:
1. Docker 이미지가 없음
   - **해결**: Docker 이미지가 자동으로 다운로드됩니다. 인터넷 연결을 확인하세요.
2. 프로젝트 폴더가 선택되지 않음
   - **해결**: 프로젝트 폴더를 선택하세요.
3. Docker가 실행되지 않음
   - **해결**: Docker Desktop을 시작하세요.

### 결과 파일이 생성되지 않음

**가능한 원인**:
1. Docker 컨테이너 실행 실패
   - **해결**: 로그를 확인하여 오류 메시지를 확인하세요.
2. 출력 디렉토리 권한 문제
   - **해결**: 출력 디렉토리에 쓰기 권한이 있는지 확인하세요.
3. 디스크 공간 부족
   - **해결**: 디스크 공간을 확보하세요.

### 결과 폴더가 자동으로 열리지 않음

**해결 방법**:
1. 결과 뷰어에서 "📂 Open Output Folder" 버튼 클릭
2. 또는 설정에서 출력 디렉토리를 확인하고 수동으로 열기

### 라이선스 등록 실패

**가능한 원인**:
1. 잘못된 라이선스 키
   - **해결**: 라이선스 키를 다시 확인하세요.
2. 인터넷 연결 문제
   - **해결**: 인터넷 연결을 확인하고 라이선스 서버에 접근할 수 있는지 확인하세요.
3. 라이선스 서버 오류
   - **해결**: 나중에 다시 시도하거나 지원팀에 문의하세요.

---

## FAQ

### Q1. MistSeeker Desktop과 MistSeeker CLI의 차이는?

**A**: MistSeeker Desktop은 MistSeeker CLI를 GUI로 사용할 수 있게 해주는 애플리케이션입니다. 내부적으로는 동일한 Docker 이미지를 사용합니다.

### Q2. Docker 없이 사용할 수 있나요?

**A**: 아니요. MistSeeker Desktop은 Docker 기반으로 작동합니다. Docker Desktop이 반드시 필요합니다.

### Q3. 분석 결과는 어디에 저장되나요?

**A**: 기본적으로 Documents 폴더의 "MistSeeker Reports" 폴더에 저장됩니다. 설정에서 변경할 수 있습니다.

**기본 경로:**
- **Windows**: `Documents\MistSeeker Reports\<프로젝트명>\<타임스탬프>\`
- **macOS**: `~/Documents/MistSeeker Reports/<프로젝트명>/<타임스탬프>/`

### Q4. 여러 프로젝트를 동시에 분석할 수 있나요?

**A**: 아니요. 한 번에 하나의 분석만 실행할 수 있습니다. 이는 리소스 관리와 결과 혼동을 방지하기 위함입니다.

### Q5. 분석을 중지할 수 있나요?

**A**: 네, 분석 진행 중 "Stop Scan" 버튼을 클릭하면 분석을 중지할 수 있습니다.

### Q6. 어떤 Docker 이미지를 사용하나요?

**A**: 기본값은 `mistseeker/mistseeker:latest`입니다. UI에서 다른 이미지 이름으로 변경할 수 있습니다.

### Q7. Pro 모드와 Free 모드의 차이는?

**A**: Pro 모드는 상세한 이슈 정보와 PDF 리포트를 제공합니다. 자세한 내용은 [라이선스 관리](#라이선스-관리) 섹션을 참조하세요.

### Q8. 결과를 공유하려면?

**A**: "📦 Create ZIP for Sharing" 버튼을 클릭하여 결과를 ZIP 파일로 압축할 수 있습니다.

### Q9. 코드를 직접 붙여넣을 수 있나요?

**A**: 네, "Paste Code Instead" 버튼을 클릭하여 코드를 붙여넣을 수 있습니다. 임시 프로젝트 폴더가 자동으로 생성됩니다.

### Q10. 분석 로그를 저장할 수 있나요?

**A**: 분석 로그는 결과 폴더의 `run.log` 파일에 저장됩니다. 또한 결과 뷰어의 "Run Log" 탭에서 확인할 수 있습니다.

---

## 기술 세부사항

### Docker 명령어

MistSeeker Desktop은 다음 Docker 명령어를 실행합니다:

```bash
docker run --rm \
  -v <PROJECT_PATH>:/workspace:ro \
  -v <OUTPUT_PATH>:/output \
  -v <LICENSE_JSON>:/license/license.json:ro \
  <IMAGE_NAME>
```

**모든 Docker 명령어는 로그에 표시됩니다** - 완전히 투명하게 작동합니다.

### 결과 파일 구조

```
Documents/MistSeeker Reports/
  └── <프로젝트명>/
      └── <YYYY-MM-DD_HH-MM-SS>/
          ├── result.json      # JSON 리포트
          ├── report.pdf       # PDF 리포트 (Pro 모드)
          └── run.log          # 실행 로그
```

### 라이선스 파일

- **위치**: 앱 데이터 디렉토리의 `license.json`
- **형식**: 서버에서 받은 서명된 JSON 파일
- **엔진 사용**: 엔진은 파일 존재 여부만 확인 (키는 알지 못함)

---

## 추가 리소스

- **MistSeeker 엔진 문서**: [MistSeeker 사용설명서](./USER_GUIDE.md) 참조
- **아키텍처 문서**: `PHILOSOPHY.md` - 앱의 설계 철학
- **문제 해결**: 이 문서의 [문제 해결](#문제-해결) 섹션

## 문의 및 지원

문제가 발생하거나 질문이 있으시면:

- **이메일**: contact@convia.vip
- **GitHub Issues**: 프로젝트 저장소의 Issues 섹션

---

**MistSeeker Desktop v1.0.0**  
© 2025 Convia. All rights reserved.

