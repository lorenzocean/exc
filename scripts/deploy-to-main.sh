#!/bin/bash

# Mirage - Deploy to Main Branch Script
# This script helps you merge the feature branch to main for deployment

set -e  # Exit on error

echo "🚀 Mirage Deployment Helper"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Feature branch name
FEATURE_BRANCH="claude/update-product-branding-011CUNQYy3n6F399qiQwDikm"

# Check if we're on the feature branch
if [ "$CURRENT_BRANCH" != "$FEATURE_BRANCH" ]; then
    echo -e "${YELLOW}⚠️  Warning: You're not on the feature branch${NC}"
    echo "Checking out feature branch..."
    git checkout "$FEATURE_BRANCH"
fi

echo ""
echo "Checking for uncommitted changes..."
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}❌ You have uncommitted changes. Please commit or stash them first.${NC}"
    git status -s
    exit 1
fi

echo -e "${GREEN}✅ Working directory is clean${NC}"
echo ""

# Check if main branch exists locally
echo "Checking if main branch exists..."
if git show-ref --quiet refs/heads/main; then
    echo "Main branch exists locally"
    MAIN_EXISTS_LOCAL=true
else
    echo "Main branch does NOT exist locally"
    MAIN_EXISTS_LOCAL=false
fi

# Check if main branch exists remotely
if git ls-remote --heads origin main | grep -q main; then
    echo "Main branch exists on remote"
    MAIN_EXISTS_REMOTE=true
else
    echo "Main branch does NOT exist on remote"
    MAIN_EXISTS_REMOTE=false
fi

echo ""
echo "================================================"
echo ""

# Scenario 1: Main doesn't exist anywhere
if [ "$MAIN_EXISTS_LOCAL" = false ] && [ "$MAIN_EXISTS_REMOTE" = false ]; then
    echo "📝 Creating new main branch from current branch..."
    git checkout -b main
    echo ""
    read -p "Push to remote as main? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Pushing main branch to remote..."
        git push -u origin main
        echo -e "${GREEN}✅ Main branch created and pushed!${NC}"
    else
        echo "Main branch created locally only."
    fi

# Scenario 2: Main exists remotely but not locally
elif [ "$MAIN_EXISTS_LOCAL" = false ] && [ "$MAIN_EXISTS_REMOTE" = true ]; then
    echo "📥 Checking out existing remote main branch..."
    git checkout -b main origin/main
    echo ""
    read -p "Merge feature branch into main? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Merging $FEATURE_BRANCH into main..."
        git merge "$FEATURE_BRANCH" --no-ff -m "Merge: Rebrand to Mirage with Dify integration"
        echo ""
        read -p "Push merged main to remote? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push origin main
            echo -e "${GREEN}✅ Merged and pushed to main!${NC}"
        fi
    fi

# Scenario 3: Main exists locally (and maybe remotely)
else
    echo "📦 Main branch exists locally"
    git checkout main

    if [ "$MAIN_EXISTS_REMOTE" = true ]; then
        echo "Pulling latest from remote main..."
        git pull origin main
    fi

    echo ""
    read -p "Merge feature branch into main? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Merging $FEATURE_BRANCH into main..."
        git merge "$FEATURE_BRANCH" --no-ff -m "Merge: Rebrand to Mirage with Dify integration"
        echo ""
        read -p "Push to remote? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push origin main
            echo -e "${GREEN}✅ Merged and pushed to main!${NC}"
        fi
    fi
fi

echo ""
echo "================================================"
echo ""
echo "📋 Next Steps:"
echo "1. Go to Render Dashboard"
echo "2. Settings → Branch → Set to 'main'"
echo "3. Manual Deploy → Clear build cache & deploy"
echo ""
echo -e "${GREEN}🎉 Done!${NC}"
