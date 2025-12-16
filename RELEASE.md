# 릴리즈 생성 가이드

## 자동 릴리즈 (GitHub Actions)

1. 태그 생성 및 푸시:
```bash
git tag v1.0.0
git push origin v1.0.0
```

2. GitHub Actions가 자동으로:
   - macOS, Windows, Linux용 빌드
   - GitHub Release 생성
   - 파일 업로드

## 수동 릴리즈 생성

GitHub Actions가 작동하지 않는 경우, 수동으로 릴리즈를 만들 수 있습니다:

### 1. 로컬에서 빌드

**macOS에서:**
```bash
npm run build
# release/ 폴더에 .dmg 파일 생성됨
```

**Windows에서:**
```bash
npm run build
# release/ 폴더에 .exe 파일 생성됨
```

**Linux에서:**
```bash
npm run build
# release/ 폴더에 .AppImage 파일 생성됨
```

### 2. GitHub에서 릴리즈 생성

1. https://github.com/tongro2025/Mistseeker-desktop/releases/new 접속
2. "Choose a tag"에서 `v1.0.0` 선택 (또는 새 태그 생성)
3. Release title: `v1.0.0` 입력
4. Description 작성 (선택사항)
5. "Attach binaries"에서 빌드된 파일 업로드:
   - macOS: `MistSeeker Desktop-1.0.0.dmg`
   - Windows: `MistSeeker Desktop Setup 1.0.0.exe`
   - Linux: `MistSeeker Desktop-1.0.0.AppImage`
6. "Publish release" 클릭

### 3. electron-builder로 직접 푸시 (권장)

GitHub Personal Access Token이 필요한 경우:

1. GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. `repo` 권한으로 토큰 생성
3. 로컬에서 실행:

```bash
GH_TOKEN=your_token_here npm run build:publish
```

이렇게 하면 electron-builder가 자동으로 GitHub Releases에 업로드합니다.
