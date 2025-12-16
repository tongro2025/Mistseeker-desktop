# 빠른 릴리즈 생성 가이드

## 현재 상황
로컬에 macOS용 `.dmg` 파일이 이미 빌드되어 있습니다: `release/MistSeeker Desktop-1.0.0.dmg`

## 수동으로 GitHub Releases에 업로드하기

### 1단계: GitHub Releases 페이지 열기
https://github.com/tongro2025/Mistseeker-desktop/releases/new

### 2단계: 릴리즈 정보 입력
- **Tag**: `v1.0.0` 선택 (또는 새로 생성)
- **Release title**: `v1.0.0`
- **Description** (선택사항):
  ```
  First release of MistSeeker Desktop
  
  - macOS installer available
  - Windows and Linux builds coming soon via GitHub Actions
  ```

### 3단계: 파일 업로드
- "Attach binaries by dropping them here or selecting them" 클릭
- 다음 파일 선택:
  - `release/MistSeeker Desktop-1.0.0.dmg`

### 4단계: 릴리즈 발행
- "Publish release" 버튼 클릭

## 다른 플랫폼 빌드하기

### Windows 빌드
Windows 머신에서:
```bash
npm install
npm run build
# release/ 폴더에 .exe 파일 생성됨
```

### Linux 빌드
Linux 머신에서:
```bash
npm install
npm run build
# release/ 폴더에 .AppImage 파일 생성됨
```

## GitHub Actions로 자동 빌드
태그를 푸시하면 GitHub Actions가 자동으로 모든 플랫폼을 빌드합니다:
```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions 페이지에서 진행 상황 확인:
https://github.com/tongro2025/Mistseeker-desktop/actions
