# GitHub Actions 설정 가이드

## 워크플로우가 실행되지 않는 경우

### 1. GitHub Actions 활성화 확인

1. GitHub 리포지토리 페이지로 이동: https://github.com/tongro2025/Mistseeker-desktop
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Actions** > **General** 클릭
4. "Workflow permissions" 섹션에서:
   - ✅ "Read and write permissions" 선택
   - ✅ "Allow GitHub Actions to create and approve pull requests" 체크
5. **Save** 클릭

### 2. 태그 다시 생성하여 워크플로우 트리거

태그가 워크플로우 파일 추가 전에 생성되었을 수 있습니다:

```bash
# 로컬 태그 삭제
git tag -d v1.0.0

# 원격 태그 삭제
git push origin :refs/tags/v1.0.0

# 새 태그 생성 (현재 최신 커밋에)
git tag v1.0.0

# 태그 푸시 (워크플로우 트리거됨)
git push origin v1.0.0
```

### 3. 수동으로 워크플로우 실행 (workflow_dispatch)

1. GitHub 리포지토리 페이지로 이동
2. **Actions** 탭 클릭
3. 왼쪽에서 **"Build and Release"** 워크플로우 선택
4. **"Run workflow"** 버튼 클릭
5. 브랜치 선택 (보통 `main`)
6. **"Run workflow"** 클릭

### 4. 워크플로우 실행 확인

1. **Actions** 탭에서 워크플로우 실행 상태 확인
2. 각 플랫폼(macOS, Windows, Linux) 빌드가 진행되는지 확인
3. 빌드 완료 후 **Releases** 페이지에서 릴리즈 확인

### 5. 문제 해결

**워크플로우가 여전히 실행되지 않으면:**

1. `.github/workflows/release.yml` 파일이 제대로 커밋되었는지 확인:
   ```bash
   git ls-files .github/workflows/
   ```

2. 워크플로우 파일 문법 확인:
   - YAML 문법 오류가 없는지
   - 들여쓰기가 올바른지 (스페이스 2개)

3. GitHub Actions 로그 확인:
   - Actions 탭에서 실패한 워크플로우 클릭
   - 에러 메시지 확인
