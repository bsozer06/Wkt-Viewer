# 🚀 CI/CD Pipeline Setup Guide

This documentation explains step by step how to set up the CI/CD pipeline for the Wkt-Viewer project.

## 📋 Table of Contents
1. [Pipeline Overview](#pipeline-overview)
2. [Netlify Setup](#netlify-setup)
3. [GitHub Secrets Configuration](#github-secrets-configuration)
4. [CI/CD Pipeline Flow](#cicd-pipeline-flow)
5. [Testing and Verification](#testing-and-verification)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Pipeline Overview

### Created Files
1. **`netlify.toml`** - Netlify configuration file
2. **`.github/workflows/ci-cd.yml`** - GitHub Actions workflow file
3. **`package.json`** - Build scripts updated

### Pipeline Stages
```
Push/PR → Lint → Test → Build → Deploy (Netlify)
```

#### 1. 🔍 Lint Stage
- Code quality check with ESLint
- Format check with Prettier
- Quick feedback

#### 2. 🧪 Test Stage
- All unit tests (114 tests)
- Code coverage report
- Headless testing with ChromeHeadless

#### 3. 🏗️ Build Stage
- Production build (`ng build --configuration production`)
- Store as artifact
- Output: `dist/gis-viewer/`

#### 4. 🚀 Deploy Stage
- Master branch → Production deploy
- Pull Request → Preview deploy
- Automatic comments and links

---

## 🌐 Netlify Setup

### Step 1: Create Netlify Account
1. Go to [netlify.com](https://www.netlify.com/)
2. Sign in with your GitHub account
3. Use "Sign up with GitHub" option

### Step 2: Create New Site

#### Method A: Manual Site Creation (Recommended)
1. Go to Netlify dashboard
2. Click "Add new site" → "Import an existing project"
3. **OR** use "Deploy manually" option
4. After site is created:
   - Site settings → Site details
   - Note the **Site ID** (e.g., `abc123-def456-ghi789`)

#### Method B: Using Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Create new site
netlify sites:create --name wkt-viewer

# Show Site ID
netlify sites:list
```

### Step 3: Get Netlify Authentication Token
1. Netlify dashboard → User settings
2. "Applications" → "Personal access tokens"
3. Click "New access token" button
4. Token name: `github-actions-deploy`
5. Copy the token and save it securely
6. ⚠️ **IMPORTANT**: This token is shown only once!

### Step 4: Site Settings (Optional)
1. Site settings → Build & deploy
2. The following are already defined in `netlify.toml`:
   - Build command: `npm run build:prod`
   - Publish directory: `dist/gis-viewer`
3. You can disable "Continuous Deployment" settings (we'll use GitHub Actions)

---

## 🔐 GitHub Secrets Configuration

### Required Secrets
You need to define the following secrets in your GitHub repository:

1. **NETLIFY_AUTH_TOKEN** - Netlify personal access token
2. **NETLIFY_SITE_ID** - Netlify site ID
3. **CODECOV_TOKEN** (Optional) - For Codecov integration

### Steps to Add Secrets
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret:

#### NETLIFY_AUTH_TOKEN
```
Name: NETLIFY_AUTH_TOKEN
Value: <Netlify token from Step 3>
```

#### NETLIFY_SITE_ID
```
Name: NETLIFY_SITE_ID
Value: <Site ID from Step 2>
```

#### CODECOV_TOKEN (Optional)
```
Name: CODECOV_TOKEN
Value: <Token from Codecov.io>
```

### Verify Secrets
```bash
# Check with GitHub CLI (requires GitHub CLI)
gh secret list
```

---

## 🔄 CI/CD Pipeline Flow

### Master Branch Push
```mermaid
graph LR
    A[Push to Master] --> B[Lint]
    B --> C[Test]
    C --> D[Build]
    D --> E[Deploy to Production]
    E --> F[Netlify Production URL]
```

**Flow:**
1. Code is pushed to master branch
2. Lint stage runs (ESLint + Prettier)
3. Test stage runs (114 unit tests)
4. Build stage runs (production build)
5. Deploy stage runs (Netlify production)
6. Deployment URL is added to commit

**Expected Duration:** ~5-8 minutes

### Pull Request
```mermaid
graph LR
    A[Create PR] --> B[Lint]
    B --> C[Test]
    C --> D[Build]
    D --> E[Deploy Preview]
    E --> F[Netlify Preview URL]
```

**Flow:**
1. Pull Request is created
2. Lint stage runs
3. Test stage runs
4. Build stage runs
5. Preview deployment is created
6. Preview URL is added as comment to PR

**Expected Duration:** ~5-8 minutes

### Develop Branch Push
```mermaid
graph LR
    A[Push to Develop] --> B[Lint]
    B --> C[Test]
    C --> D[Build]
    D --> E[Artifacts Saved]
```

**Flow:**
1. Code is pushed to develop branch
2. Lint, test and build run
3. No deployment, only build artifacts are saved
4. Verification before merging to master

---

## ✅ Testing and Verification

### Local Testing
Run locally to test the pipeline:

```bash
# 1. Lint check
npm run lint

# 2. Format check
npm run format -- --check

# 3. Run tests
npm run test:ci

# 4. Production build
npm run build:prod

# 5. Check build output
ls dist/gis-viewer
```

### First Deploy
1. Commit all changes:
```bash
git add .
git commit -m "feat: add CI/CD pipeline with Netlify"
git push origin master
```

2. Go to GitHub Actions tab
3. Watch the workflow run
4. Verify that each stage is successful

### Deployment Verification
1. Open "Deploy to Netlify" job in GitHub Actions
2. Find the Netlify deployment URL
3. Open the URL in browser
4. Verify the application is running

### Preview Deploy Test
1. Create a new branch:
```bash
git checkout -b feature/test-ci-cd
```

2. Make a small change
3. Push and create PR:
```bash
git add .
git commit -m "test: CI/CD preview"
git push origin feature/test-ci-cd
```

4. Check the Netlify preview link in the PR

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "NETLIFY_AUTH_TOKEN not found"
**Issue:** GitHub Secrets not defined

**Solution:**
- GitHub → Settings → Secrets → Actions
- Add NETLIFY_AUTH_TOKEN

#### 2. "NETLIFY_SITE_ID not found"
**Issue:** Site ID is incorrect or missing

**Solution:**
- Netlify → Site settings → Site details
- Copy Site ID and add to GitHub Secrets

#### 3. "Build failed: Cannot find module"
**Issue:** Missing dependencies

**Solution:**
```bash
# Commit package-lock.json
git add package-lock.json
git commit -m "chore: add package-lock.json"
git push
```

#### 4. "Tests failed in CI"
**Issue:** Tests pass locally but fail in CI

**Solution:**
```bash
# Simulate CI environment
npm run test:ci

# For ChromeHeadless issues
# Check customLaunchers in karma.conf.js
```

#### 5. "Netlify Deploy Timeout"
**Issue:** Deploy takes longer than 5 minutes

**Solution:**
- Increase `timeout-minutes` in `ci-cd.yml`:
```yaml
timeout-minutes: 10
```

#### 6. "Angular Routing 404"
**Issue:** Routes don't work on Netlify

**Solution:**
- Check if redirect rule exists in `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Log Inspection
```bash
# GitHub Actions logs
# GitHub → Actions → Relevant workflow → Job details

# Netlify deploy logs
# Netlify → Deploys → Relevant deploy → Deploy log
```

---

## 📊 Monitoring and Optimization

### Optimizing Build Time
1. **Cache usage**: npm cache is already active in GitHub Actions
2. **Parallel jobs**: Lint and test can run in parallel (currently sequential)
3. **Incremental build**: Use Angular's incremental build feature

### Notifications
1. **Slack integration**: GitHub Actions → Slack
2. **Email notifications**: GitHub Settings → Notifications
3. **Netlify notifications**: Netlify → Site settings → Build & deploy → Deploy notifications

### Metrics
- **Build success rate**: GitHub Actions → Insights
- **Deploy time**: Netlify → Site analytics
- **Test coverage**: Codecov dashboard

---

## 🎉 Conclusion

CI/CD pipeline successfully set up! Now you have:

✅ Automatic tests on every push
✅ Automatic build on every push
✅ Automatic deploy on master branch
✅ Automatic preview on PRs
✅ Code quality checks

### Next Steps
1. Add badges to README.md
2. Codecov integration
3. Add E2E tests
4. Performance monitoring (Lighthouse CI)
5. Automated versioning (semantic-release)

### Pipeline Badge
To add to README.md:
```markdown
![CI/CD](https://github.com/bsozer06/Wkt-Viewer/workflows/CI/CD%20Pipeline/badge.svg)
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)
```

---

## 📞 Support

If you encounter any issues:
1. Open GitHub Issues
2. Share pipeline logs
3. Include error messages

**Happy deployments! 🚀**
