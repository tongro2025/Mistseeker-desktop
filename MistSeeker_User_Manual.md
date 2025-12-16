# MistSeeker 사용설명서

## 목차

1. [제품 소개](#제품-소개)
2. [시작하기](#시작하기)
3. [기본 사용법](#기본-사용법)
4. [고급 기능](#고급-기능)
5. [리포트 이해하기](#리포트-이해하기)
6. [라이선스 관리](#라이선스-관리)
7. [문제 해결](#문제-해결)
8. [FAQ](#faq)

---

## 제품 소개

### MistSeeker란?

MistSeeker는 코드의 수학적 안정성을 분석하는 도구입니다. COI (Code Organization Index), ORI (Operation Reliability Index), GSS (Geometric Stability Score)를 기반으로 코드의 구조적 안정성과 실행 안정성을 평가합니다.

### 주요 기능

- **COI (Code Organization Index)**: 코드 구조 및 기하적 안정성 분석
- **ORI (Operation Reliability Index)**: 실행 안정성 및 부수효과 분석
- **GSS (Geometric Stability Score)**: 기하적 안정성 분석 (선택적)
- **GSI (Global Stability Index)**: 전체 안정성 종합 점수
- **0~100 점수 및 Grade 시스템**: 직관적인 점수 표시
- **PNG 리포트 생성**: 시각화된 분석 리포트
- **Free/Pro 모드**: 무료 모드와 유료 모드 지원
- **Docker 지원**: 컨테이너 기반 실행
- **이미지 암호화**: AES-256-GCM 기반 로컬 이미지 암호화

### 지원 언어

MistSeeker는 다음 프로그래밍 언어를 지원합니다:

- **Python** (.py, .pyw, .pyi) - AST 기반 분석
- **JavaScript** (.js, .jsx, .mjs, .cjs) - tree-sitter 기반 분석
- **TypeScript** (.ts, .tsx) - tree-sitter 기반 분석
- **Java** (.java) - tree-sitter 기반 분석
- **Go** (.go) - tree-sitter 기반 분석
- **Rust** (.rs) - tree-sitter 기반 분석
- **C/C++** (.c, .h, .cpp, .hpp, .cxx, .hxx, ...) - tree-sitter 기반 분석
- **Ruby** (.rb, .rbw) - tree-sitter 기반 분석
- **PHP** (.php, .php3, .php4, .php5, .phtml) - tree-sitter 기반 분석
- **C#** (.cs) - tree-sitter 기반 분석

---

## 시작하기

### 시스템 요구사항

- **Docker** (권장): Docker Desktop 또는 Docker Engine 설치 필요
- **Python 3.11+** (선택): 로컬 설치 시 필요
- **운영체제**: Windows, macOS, Linux 지원
- **아키텍처**: AMD64 (x86_64), ARM64 (aarch64) 지원
  - Intel/AMD 프로세서 (AMD64)
  - Apple Silicon (M1/M2/M3 등, ARM64)
  - AWS Graviton (ARM64)
  - Raspberry Pi 4+ (ARM64)

### 설치 방법

#### 방법 1: Docker 사용 (권장)

가장 간단한 방법입니다. Docker만 설치되어 있으면 바로 사용할 수 있습니다.

**Linux/macOS:**
```bash
# Docker Hub에서 이미지 다운로드
docker pull tongro2025/mistseeker:latest

# 버전 확인
docker run --rm tongro2025/mistseeker:latest --help
```

**Windows:**
```cmd
REM Docker Hub에서 이미지 다운로드
docker pull tongro2025/mistseeker:latest

REM 버전 확인
docker run --rm tongro2025/mistseeker:latest --help
```

**자동 설치 스크립트 사용:**

- **Linux/macOS**: `./install-mistseeker.sh` 실행
- **Windows**: `install-mistseeker.bat` 더블클릭 또는 명령 프롬프트에서 실행

#### 방법 2: 로컬 Python 패키지 설치

개발자나 고급 사용자를 위한 방법입니다.

```bash
# 저장소 클론
git clone <repository-url>
cd Mistseeker-Coder

# 가상 환경 생성 (선택)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 패키지 설치
pip install -e .
```

---

## 기본 사용법

### 1. 단일 파일 분석

가장 간단한 사용법입니다. 하나의 파일을 분석할 때 사용합니다.

**Linux/macOS:**
```bash
# Docker 사용
docker run --rm -v $(pwd):/workspace:ro -v $(pwd)/output:/output \
  tongro2025/mistseeker:latest \
  analyze --input-code /workspace/example.py

# 로컬 설치 사용
mistseeker analyze --input-code example.py
```

**Windows:**
```cmd
REM Docker 사용
docker run --rm -v %CD%:/workspace:ro -v %CD%\output:/output ^
  tongro2025/mistseeker:latest ^
  analyze --input-code /workspace/example.py

REM 로컬 설치 사용
mistseeker analyze --input-code example.py
```

**런처 스크립트 사용 (권장):**
- **Linux/macOS**: `./mistseeker_launcher.sh analyze --input-code example.py`
- **Windows**: `mistseeker_launcher.bat analyze --input-code example.py`

**결과:**
- `./mistseeker_report.json`: JSON 형식의 상세 리포트
- `./mistseeker_report.png`: 시각화된 PNG 리포트 이미지

### 2. 프로젝트 전체 분석

프로젝트의 모든 파일을 분석할 때 사용합니다.

**Linux/macOS:**
```bash
# Docker 사용
docker run --rm -v $(pwd):/workspace:ro -v $(pwd)/output:/output \
  tongro2025/mistseeker:latest \
  analyze --input-root /workspace

# 로컬 설치 사용
mistseeker analyze --input-root ./src
```

**Windows:**
```cmd
REM Docker 사용
docker run --rm -v %CD%:/workspace:ro -v %CD%\output:/output ^
  tongro2025/mistseeker:latest ^
  analyze --input-root /workspace

REM 로컬 설치 사용
mistseeker analyze --input-root .\src
```

**런처 스크립트 사용 (권장):**
- **Linux/macOS**: `./mistseeker_launcher.sh analyze --input-root .`
- **Windows**: `mistseeker_launcher.bat analyze --input-root .`

### 3. 출력 경로 지정

리포트를 특정 위치에 저장하려면:

**Linux/macOS:**
```bash
docker run --rm -v $(pwd):/workspace:ro -v $(pwd)/reports:/output \
  tongro2025/mistseeker:latest \
  analyze \
    --input-root /workspace \
    --output-json /output/analysis.json \
    --output-image /output/analysis.png
```

**Windows:**
```cmd
docker run --rm -v %CD%:/workspace:ro -v %CD%\reports:/output ^
  tongro2025/mistseeker:latest ^
  analyze ^
    --input-root /workspace ^
    --output-json /output/analysis.json ^
    --output-image /output/analysis.png
```

---

## 고급 기능

### 1. Pro 모드 사용

Pro 모드는 더 상세한 분석 결과를 제공합니다.

#### 라이선스 키 설정

**Linux/macOS:**
```bash
# 환경 변수로 라이선스 키 제공 (Docker)
docker run --rm -v $(pwd):/workspace:ro -v $(pwd)/output:/output \
  -e MISTSEEKER_LICENSE_KEY="your-license-key" \
  tongro2025/mistseeker:latest \
  pro analyze --input-root /workspace

# 로컬에서 라이선스 키 저장
mistseeker license --key "your-license-key"

# 이후 자동으로 Pro 모드로 실행
mistseeker analyze --input-root ./src
```

**Windows:**
```cmd
REM 환경 변수로 라이선스 키 제공 (Docker)
docker run --rm -v %CD%:/workspace:ro -v %CD%\output:/output ^
  -e MISTSEEKER_LICENSE_KEY=your-license-key ^
  tongro2025/mistseeker:latest ^
  pro analyze --input-root /workspace

REM 로컬에서 라이선스 키 저장
mistseeker license --key "your-license-key"

REM 이후 자동으로 Pro 모드로 실행
mistseeker analyze --input-root .\src
```

#### Pro 모드의 장점

- **상세한 이슈 정보**: 문제가 발생한 정확한 라인과 함수
- **세그먼트 분석**: 문제 구간의 상세 분석
- **PNG 리포트 확장**: Pro 전용 섹션 잠금 해제
- **ORI 이슈 그룹화**: 유사한 문제들을 그룹화하여 표시

### 2. Geometric Engine 활성화 (GSS 계산)

기하적 안정성 분석을 활성화합니다.

```bash
docker run --rm -v $(pwd):/workspace:ro -v $(pwd)/output:/output \
  tongro2025/mistseeker:latest \
  analyze \
    --input-root /workspace \
    --enable-geometric
```

### 3. 임계값 조정

분석 기준을 조정할 수 있습니다.

```bash
# 더 엄격한 기준 (기본값: 0.7)
docker run --rm -v $(pwd):/workspace:ro -v $(pwd)/output:/output \
  tongro2025/mistseeker:latest \
  analyze \
    --input-root /workspace \
    --coi-threshold 0.8 \
    --ori-threshold 0.8 \
    --gss-threshold 0.8

# 더 관대한 기준
docker run --rm -v $(pwd):/workspace:ro -v $(pwd)/output:/output \
  tongro2025/mistseeker:latest \
  analyze \
    --input-root /workspace \
    --coi-threshold 0.6 \
    --ori-threshold 0.6
```

### 4. 이미지 암호화

민감한 이미지 데이터를 보호하기 위한 암호화 기능입니다.

```bash
# 환경 변수로 키 제공
export MISTSEEKER_IMAGE_KEY="your-base64-key"
docker run --rm -v $(pwd):/workspace:ro -v $(pwd)/output:/output \
  -e MISTSEEKER_IMAGE_KEY="your-base64-key" \
  tongro2025/mistseeker:latest \
  analyze \
    --input-root /workspace \
    --encrypt-images \
    --image-root /workspace/images

# 키 파일로 제공
docker run --rm -v $(pwd):/workspace:ro -v $(pwd)/output:/output \
  tongro2025/mistseeker:latest \
  analyze \
    --input-root /workspace \
    --encrypt-images \
    --image-root /workspace/images \
    --image-key-file /workspace/key.txt

# Pro 모드: 라이선스 기반 키 파생
docker run --rm -v $(pwd):/workspace:ro -v $(pwd)/output:/output \
  -e MISTSEEKER_LICENSE_KEY="your-pro-key" \
  tongro2025/mistseeker:latest \
  pro analyze \
    --input-root /workspace \
    --encrypt-images \
    --image-root /workspace/images
```

---

## 리포트 이해하기

### 점수 체계

MistSeeker는 각 축을 0~1(또는 0~100점) 범위로 환산합니다.

#### COI (Code Organization Index)
- **의미**: 코드 구조 안정성
- **평가 요소**: 함수 복잡도, 중첩 깊이, 함수 길이, 분기 구조 등
- **높을수록 좋음**: 구조가 명확하고 유지보수하기 쉬움

#### ORI (Operation Reliability Index)
- **의미**: 실행 안정성/부수효과
- **평가 요소**: 전역 상태 변경, I/O, 상태ful 패턴, 예외 흐름 등
- **높을수록 좋음**: 부수효과가 적고 안정적으로 실행됨

#### GSS (Geometric Stability Score)
- **의미**: 기하적/패턴 기반 안정성
- **평가 요소**: 코드 구조의 일관성, 모듈 간 관계 등
- **높을수록 좋음**: 코드 패턴이 일관되고 예측 가능함

#### GSI (Global Stability Index)
- **의미**: 전체 안정성 종합 점수
- **계산**: COI, ORI, GSS의 가중 평균
- **범위**: 0~100점

### Grade 체계

- **A+**: 95~100점 - 매우 우수
- **A**: 90~94점 - 우수
- **B+**: 85~89점 - 양호
- **B**: 80~84점 - 보통
- **C+**: 75~79점 - 개선 필요
- **C**: 70~74점 - 주의 필요
- **D**: 60~69점 - 경고
- **F**: 0~59점 - 위험

### JSON 리포트 구조

```json
{
  "mode": "PRO",
  "summary": {
    "file_count": 10,
    "problem_file_count": 2,
    "avg_coi": 0.85,
    "avg_ori": 0.78,
    "avg_gss": 0.82,
    "scores": {
      "coi": {
        "raw": 0.85,
        "score_100": 85.0,
        "grade": "B"
      },
      "ori": {
        "raw": 0.78,
        "score_100": 78.0,
        "grade": "C+"
      },
      "gsi": {
        "raw": 0.815,
        "score_100": 81.5,
        "grade": "B"
      }
    }
  },
  "files": [
    {
      "path": "example.py",
      "coi": 0.85,
      "ori": 0.78,
      "gss": 0.82,
      "problem": false,
      "segments": [
        {
          "start_line": 40,
          "end_line": 85,
          "kind": "coi",
          "severity": "warning",
          "message": "High complexity detected"
        }
      ],
      "issues_raw": [
        {
          "line": 52,
          "end_line": 52,
          "severity": "warning",
          "kind": "coi",
          "message": "Cyclomatic complexity is high"
        }
      ]
    }
  ]
}
```

### PNG 리포트

PNG 리포트는 시각적으로 분석 결과를 보여줍니다:

- **상단**: 프로젝트 정보, 분석 시간, MistSeeker 버전
- **중앙**: COI/ORI/GSS/GSI 점수 차트 (바 차트)
- **오른쪽**: Global Stability Index (숫자), Grade
- **하단**: 
  - Free 모드: 문제 파일 개수, 요약 메시지
  - Pro 모드: Top N 문제 파일/함수, 주요 이슈 요약

---

## 라이선스 관리

### Free 모드 vs Pro 모드

#### Free 모드
- **비용**: 무료
- **제공 기능**:
  - COI/ORI/GSI 점수 및 등급
  - 프로젝트/파일 단위 요약 통계
  - 기본 PNG 리포트 생성
  - 이슈 개수 정보
- **제한 사항**:
  - 상세 이슈 정보 제한
  - PNG 리포트의 Pro 전용 섹션 잠금

#### Pro 모드
- **비용**: 유료 (라이선스 키 필요)
- **제공 기능**:
  - Free 모드의 모든 기능
  - 각 파일의 상세 이슈 정보 (라인 단위)
  - 문제 구간(segments) 분석
  - PNG 리포트 Pro 전용 섹션 잠금 해제
  - Top N 위험 함수/파일
  - 주요 ORI/COI 패턴 요약
  - CI/CD 통합에 적합한 상세 리포트

### 라이선스 키 관리

#### 라이선스 키 저장

```bash
# 로컬에 라이선스 키 저장
mistseeker license --key "your-license-key"
```

#### 라이선스 상태 확인

```bash
# 현재 라이선스 상태 확인
mistseeker license --status
```

#### 라이선스 제거

```bash
# 저장된 라이선스 제거 (Free 모드로 전환)
mistseeker license --remove
```

### Docker에서 라이선스 사용

**Linux/macOS:**
```bash
# 환경 변수로 라이선스 키 제공
docker run --rm -v $(pwd):/workspace:ro -v $(pwd)/output:/output \
  -e MISTSEEKER_LICENSE_KEY="your-license-key" \
  tongro2025/mistseeker:latest \
  pro analyze --input-root /workspace

# 라이선스 파일 마운트 (선택)
docker run --rm -v $(pwd):/workspace:ro -v $(pwd)/output:/output \
  -v $(pwd)/license.json:/license/license.json:ro \
  tongro2025/mistseeker:latest \
  pro analyze --input-root /workspace

# 라이선스 서버 URL 지정 (선택)
docker run --rm -v $(pwd):/workspace:ro -v $(pwd)/output:/output \
  -e MISTSEEKER_LICENSE_KEY="your-license-key" \
  -e LICENSE_SERVER_URL="https://convia.vip" \
  tongro2025/mistseeker:latest \
  pro analyze --input-root /workspace
```

**Windows:**
```cmd
REM 환경 변수로 라이선스 키 제공
docker run --rm -v %CD%:/workspace:ro -v %CD%\output:/output ^
  -e MISTSEEKER_LICENSE_KEY=your-license-key ^
  tongro2025/mistseeker:latest ^
  pro analyze --input-root /workspace

REM 라이선스 파일 마운트 (선택)
docker run --rm -v %CD%:/workspace:ro -v %CD%\output:/output ^
  -v %CD%\license.json:/license/license.json:ro ^
  tongro2025/mistseeker:latest ^
  pro analyze --input-root /workspace

REM 라이선스 서버 URL 지정 (선택)
docker run --rm -v %CD%:/workspace:ro -v %CD%\output:/output ^
  -e MISTSEEKER_LICENSE_KEY=your-license-key ^
  -e LICENSE_SERVER_URL=https://convia.vip ^
  tongro2025/mistseeker:latest ^
  pro analyze --input-root /workspace
```

### 라이선스 서명 검증

Pro 모드에서는 라이선스 서명 검증이 수행됩니다:

1. **라이선스 데이터 수신**
2. **서명 검증**:
   - 수신한 데이터에서 `signature` 제거
   - 나머지 데이터로 서명 재계산 (HMAC-SHA256)
   - 재계산한 서명과 수신한 서명 비교
3. **일치하면 프로모드 활성화**, 불일치하면 오류

**서명이 없는 경우:**
- `LICENSE_SIGNATURE_SECRET`이 설정되지 않은 경우:
  - API는 서명 없이 응답 반환
  - MistSeeker는 하위 호환성 모드로 진행 (경고 메시지)
- `LICENSE_SIGNATURE_SECRET`이 설정된 경우:
  - 서명이 없으면 검증 실패
  - 서명이 있으면 암호학적 검증 수행

---

## 문제 해결

### 1. Docker 이미지 다운로드 실패

```bash
# 네트워크 연결 확인
ping hub.docker.com

# Docker 로그인 확인
docker login

# 이미지 다시 다운로드
docker pull tongro2025/mistseeker:latest
```

### 2. 라이선스 검증 실패

**증상**: "License verification failed" 오류

**해결 방법**:

```bash
# 1. 라이선스 키 확인
echo $MISTSEEKER_LICENSE_KEY

# 2. 라이선스 상태 확인
mistseeker license --status

# 3. 라이선스 재설정
mistseeker license --remove
mistseeker license --key "your-license-key"

# 4. 라이선스 서버 URL 확인
docker run --rm \
  -e MISTSEEKER_LICENSE_KEY="your-key" \
  -e LICENSE_SERVER_URL="https://convia.vip" \
  tongro2025/mistseeker:latest pro --help
```

**일반적인 원인**:
- 라이선스 키 오타
- 라이선스 만료
- 네트워크 연결 문제
- 라이선스 서버 접근 불가

### 3. PNG 리포트 생성 실패

**증상**: PNG 파일이 생성되지 않음

**해결 방법**:

```bash
# 1. Pro 모드 확인
mistseeker license --status

# 2. matplotlib 설치 확인 (로컬 설치 시)
pip install matplotlib pillow

# 3. 출력 경로 권한 확인
ls -la ./reports/
chmod 755 ./reports/
```

### 4. 메모리 부족 오류

**증상**: 대규모 프로젝트 분석 시 메모리 부족

**해결 방법**:

```bash
# Docker 메모리 제한 증가
docker run --memory=4g --rm -v $(pwd):/workspace:ro -v $(pwd)/output:/output \
  tongro2025/mistseeker:latest \
  analyze --input-root /workspace

# 프로젝트를 작은 단위로 나누어 분석
docker run --rm -v $(pwd):/workspace:ro -v $(pwd)/output:/output \
  tongro2025/mistseeker:latest \
  analyze --input-root /workspace/src/module1
```

### 5. 이미지 암호화 키 오류

**증상**: "Failed to get image encryption key" 오류

**해결 방법**:

```bash
# 1. 환경 변수 확인
echo $MISTSEEKER_IMAGE_KEY

# 2. 키 파일 확인
ls -la ~/.mistseeker/image_key.txt

# 3. 키 재생성 (Python 필요)
python3 -c "
from mistseeker.security.key_manager import ImageKeyManager
import base64
key = ImageKeyManager.generate_key()
print(base64.b64encode(key).decode())
"
```

### 6. 파일 경로 오류

**증상**: "File not found" 또는 "Directory not found"

**해결 방법**:

**Linux/macOS:**
```bash
# 1. 절대 경로 사용
docker run --rm -v /absolute/path:/workspace:ro -v /absolute/path/output:/output \
  tongro2025/mistseeker:latest \
  analyze --input-root /workspace

# 2. 현재 디렉토리 확인
pwd
ls -la

# 3. Docker 볼륨 마운트 확인
docker run --rm -v $(pwd):/workspace:ro -v $(pwd)/output:/output \
  tongro2025/mistseeker:latest \
  ls -la /workspace
```

**Windows:**
```cmd
REM 1. 절대 경로 사용
docker run --rm -v C:\absolute\path:/workspace:ro -v C:\absolute\path\output:/output ^
  tongro2025/mistseeker:latest ^
  analyze --input-root /workspace

REM 2. 현재 디렉토리 확인
cd
dir

REM 3. Docker 볼륨 마운트 확인
docker run --rm -v %CD%:/workspace:ro -v %CD%\output:/output ^
  tongro2025/mistseeker:latest ^
  ls -la /workspace

REM 4. 경로에 공백이 있는 경우 따옴표 사용
docker run --rm -v "C:\My Project":/workspace:ro -v "C:\My Project\output":/output ^
  tongro2025/mistseeker:latest ^
  analyze --input-root /workspace
```

### 7. Windows 특정 문제

**증상**: Docker Desktop이 실행되지 않음

**해결 방법**:
1. Docker Desktop이 설치되어 있는지 확인
2. Docker Desktop을 시작하고 시스템 트레이 아이콘 확인
3. WSL 2 백엔드 사용 시 WSL 2가 설치되어 있는지 확인

**증상**: 경로 관련 오류 (백슬래시 문제)

**해결 방법**:
- Docker 컨테이너 내부에서는 항상 슬래시(`/`)를 사용합니다
- Windows 경로는 Docker 볼륨 마운트 시 자동으로 변환됩니다
- 예: `C:\Users\Name\Project` → `/c/Users/Name/Project` (WSL) 또는 그대로 사용 (Docker Desktop)

**증상**: 명령 프롬프트에서 한글 깨짐

**해결 방법**:
```cmd
REM 코드 페이지를 UTF-8로 변경
chcp 65001

REM 또는 PowerShell 사용 (권장)
```

---

## FAQ

### Q1. Free 모드와 Pro 모드의 차이는 무엇인가요?

**A**: Free 모드는 기본적인 분석 결과를 제공하며, Pro 모드는 상세한 이슈 정보와 고급 기능을 제공합니다. 자세한 내용은 [라이선스 관리](#라이선스-관리) 섹션을 참조하세요.

### Q2. Docker 없이 사용할 수 있나요?

**A**: 네, Python 패키지로 로컬 설치하여 사용할 수 있습니다. 하지만 Docker 사용을 권장합니다.

**로컬 설치 방법:**
```bash
# Linux/macOS
git clone <repository-url>
cd Mistseeker-Coder
python -m venv venv
source venv/bin/activate
pip install -e .

# Windows
git clone <repository-url>
cd Mistseeker-Coder
python -m venv venv
venv\Scripts\activate
pip install -e .
```

### Q3. 어떤 프로그래밍 언어를 지원하나요?

**A**: Python, JavaScript, TypeScript, Java, Go, Rust, C/C++, Ruby, PHP, C# 등을 지원합니다. 자세한 내용은 [제품 소개](#제품-소개) 섹션을 참조하세요.

### Q4. 리포트는 어디에 저장되나요?

**A**: 기본적으로 현재 디렉토리에 `mistseeker_report.json`과 `mistseeker_report.png`가 생성됩니다. `--output-json`과 `--output-image` 옵션으로 경로를 지정할 수 있습니다. Docker 사용 시 `/output` 볼륨에 저장됩니다.

### Q5. CI/CD 파이프라인에 통합할 수 있나요?

**A**: 네, 가능합니다. GitHub Actions, GitLab CI, Jenkins 등에서 Docker를 사용하여 MistSeeker를 실행할 수 있습니다.

**예시 (GitHub Actions - Linux/macOS)**:

```yaml
- name: Run MistSeeker
  run: |
    docker run --rm \
      -v ${{ github.workspace }}:/workspace:ro \
      -v ${{ github.workspace }}/artifacts:/output \
      tongro2025/mistseeker:latest \
      analyze \
        --input-root /workspace \
        --output-json /output/report.json \
        --output-image /output/report.png
```

**예시 (GitHub Actions - Windows)**:

```yaml
- name: Run MistSeeker
  shell: cmd
  run: |
    docker run --rm ^
      -v %GITHUB_WORKSPACE%:/workspace:ro ^
      -v %GITHUB_WORKSPACE%\artifacts:/output ^
      tongro2025/mistseeker:latest ^
      analyze ^
        --input-root /workspace ^
        --output-json /output/report.json ^
        --output-image /output/report.png
```

### Q6. 점수가 낮으면 어떻게 해야 하나요?

**A**: 리포트에서 문제가 된 파일과 라인을 확인하고, 다음을 개선하세요:
- **COI 개선**: 함수 복잡도 감소, 중첩 깊이 줄이기
- **ORI 개선**: 전역 상태 사용 최소화, 부수효과 제거
- **GSS 개선**: 코드 패턴 일관성 유지

### Q7. 라이선스 키는 어디서 구매하나요?

**A**: 라이선스 키는 공식 웹사이트에서 구매할 수 있습니다. 문의: contact@convia.vip

### Q8. 이미지 암호화는 필수인가요?

**A**: 아니요, 선택 사항입니다. 민감한 이미지 데이터를 보호해야 할 때만 사용하세요.

### Q9. 대규모 프로젝트도 분석할 수 있나요?

**A**: 네, 가능합니다. 하지만 메모리 사용량이 많을 수 있으므로 Docker 메모리 제한을 조정하거나 프로젝트를 작은 단위로 나누어 분석하는 것을 권장합니다.

### Q10. 분석 결과를 다른 도구와 통합할 수 있나요?

**A**: 네, JSON 리포트를 파싱하여 다른 도구와 통합할 수 있습니다. JSON 형식은 표준적이며 구조화되어 있습니다.

---

## 추가 리소스

- **아키텍처 문서**: `doc/ARCHITECTURE.md` - COI/ORI/GSS 정의 및 계산 로직
- **Docker 가이드**: `doc/DOCKER_QUICK_START.md` - Docker 빠른 시작 가이드
- **멀티 아키텍처 빌드**: `doc/MULTIARCH_BUILD.md` - AMD64/ARM64 지원 빌드 방법
- **라이선스 통합 가이드**: `doc/DOCKER_LICENSE_INTEGRATION.md` - 라이선스 서버 통합 가이드
- **암호화 스펙**: `doc/ENCRYPTION_SPEC.md` - 이미지 암호화 상세 스펙
- **문제 해결 가이드**: `doc/TROUBLESHOOTING.md` - 자세한 문제 해결 방법

## 문의 및 지원

문제가 발생하거나 질문이 있으시면:

- **이메일**: contact@convia.vip
- **GitHub Issues**: 프로젝트 저장소의 Issues 섹션

---

**MistSeeker v0.1.0**  
© 2025 Convia. All rights reserved.

