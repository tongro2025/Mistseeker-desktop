# GitHub Actions 워크플로우 수동 실행 가이드

## 방법 1: GitHub 웹 인터페이스에서 실행 (권장)

1. **GitHub 리포지토리 페이지로 이동**
   - https://github.com/tongro2025/Mistseeker-desktop

2. **Actions 탭 클릭**
   - 상단 메뉴에서 "Actions" 탭 선택

3. **워크플로우 선택**
   - 왼쪽 사이드바에서 "Build and Release" 워크플로우 클릭

4. **수동 실행**
   - 오른쪽 상단의 **"Run workflow"** 버튼 클릭
   - 브랜치 선택: `main` (또는 원하는 브랜치)
   - **"Run workflow"** 버튼 클릭

5. **실행 상태 확인**
   - 워크플로우 실행이 시작되면 목록에 표시됨
   - 클릭하여 각 단계의 진행 상황 확인

## 방법 2: 태그 푸시로 자동 실행

```bash
# 로컬에서 태그 생성 및 푸시
git tag v1.0.0
git push origin v1.0.0
```

태그가 푸시되면 자동으로 워크플로우가 실행됩니다.

## 방법 3: GitHub CLI로 실행

```bash
# GitHub CLI 설치 필요
gh workflow run "Build and Release"
```

## 워크플로우 실행 확인

1. **Actions 페이지에서 확인**
   - https://github.com/tongro2025/Mistseeker-desktop/actions
   - 실행 중인 워크플로우는 노란색 원 아이콘
   - 성공한 워크플로우는 초록색 체크 아이콘
   - 실패한 워크플로우는 빨간색 X 아이콘

2. **각 단계 확인**
   - 워크플로우를 클릭하여 상세 정보 확인
   - 각 단계를 클릭하여 로그 확인

## 문제 해결

### 워크플로우가 실행되지 않는 경우

1. **GitHub Actions 활성화 확인**
   - Settings > Actions > General
   - "Workflow permissions"에서 "Read and write permissions" 선택

2. **워크플로우 파일 확인**
   - `.github/workflows/release.yml` 파일이 존재하는지 확인
   - YAML 문법 오류가 없는지 확인

3. **권한 확인**
   - 리포지토리에 대한 쓰기 권한이 있는지 확인

### 빌드 실패 시

1. **로그 확인**
   - 실패한 단계를 클릭하여 에러 메시지 확인
   - 특히 "Build Electron app" 단계 확인

2. **일반적인 문제**
   - 의존성 설치 실패: `npm ci` 단계 확인
   - 빌드 실패: `npm run build` 단계 확인
   - 파일 없음: "List release directory" 단계 확인

## 예상 실행 시간

- **macOS 빌드**: 약 5-10분
- **Windows 빌드**: 약 5-10분
- **Linux 빌드**: 약 5-10분
- **릴리즈 생성**: 약 1-2분

**총 예상 시간**: 약 15-20분 (병렬 실행)

## 성공 시 결과

워크플로우가 성공적으로 완료되면:

1. **GitHub Releases 페이지 확인**
   - https://github.com/tongro2025/Mistseeker-desktop/releases
   - v1.0.0 릴리즈가 생성됨
   - 다음 파일들이 업로드됨:
     - `MistSeeker Desktop-1.0.0.dmg` (macOS)
     - `MistSeeker Desktop Setup 1.0.0.exe` (Windows)
     - `MistSeeker Desktop-1.0.0.AppImage` (Linux)
     - `MistSeeker-Desktop-1.0.0-all-platforms.zip` (모든 플랫폼)

2. **다운로드 가능**
   - 릴리즈 페이지에서 각 플랫폼별 파일 다운로드 가능
   - 또는 ZIP 파일로 모든 플랫폼 파일 다운로드 가능
