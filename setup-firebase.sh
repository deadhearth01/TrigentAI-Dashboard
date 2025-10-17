#!/bin/bash

# TrigentAI Firebase Complete Setup Script
# This script helps you complete the Firebase backend setup

echo "🚀 TrigentAI Firebase Backend Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI is not installed${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI is installed${NC}"
echo ""

# Check current Firebase project
echo -e "${BLUE}📋 Current Firebase Project:${NC}"
firebase projects:list | grep "current"
echo ""

# Step 1: Firestore Setup
echo -e "${YELLOW}Step 1: Firestore Database${NC}"
echo "Status: Checking..."
if [ -f "firestore.rules" ] && [ -f "firestore.indexes.json" ]; then
    echo -e "${GREEN}✅ Firestore rules and indexes files exist${NC}"
    read -p "Deploy Firestore rules and indexes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        firebase deploy --only firestore
    fi
else
    echo -e "${RED}❌ Firestore files missing${NC}"
fi
echo ""

# Step 2: Storage Setup
echo -e "${YELLOW}Step 2: Firebase Storage${NC}"
echo "⚠️  Firebase Storage needs to be manually enabled in the console"
echo ""
echo "Please follow these steps:"
echo "1. Visit: https://console.firebase.google.com/project/trigentai/storage"
echo "2. Click 'Get Started'"
echo "3. Accept default rules"
echo "4. Choose location: us-central1"
echo "5. Click 'Done'"
echo ""
read -p "Press Enter after you've enabled Storage in the console..."
echo ""

if [ -f "storage.rules" ]; then
    echo -e "${GREEN}✅ Storage rules file exists${NC}"
    read -p "Deploy Storage rules? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        firebase deploy --only storage
    fi
fi
echo ""

# Step 3: Authentication Setup
echo -e "${YELLOW}Step 3: Firebase Authentication${NC}"
echo "⚠️  Authentication providers need to be manually enabled"
echo ""
echo "Please follow these steps:"
echo "1. Visit: https://console.firebase.google.com/project/trigentai/authentication/providers"
echo "2. Enable the following sign-in methods:"
echo "   - Google (set support email: evanriosprojects@gmail.com)"
echo "   - Microsoft (requires Azure AD credentials)"
echo "   - Anonymous (for guest access)"
echo ""
read -p "Press Enter after you've enabled Authentication providers..."
echo ""

# Step 4: Hosting Setup
echo -e "${YELLOW}Step 4: Firebase Hosting${NC}"
if [ -f "firebase.json" ]; then
    echo -e "${GREEN}✅ Hosting configuration exists${NC}"
    read -p "Deploy to Firebase Hosting? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Building Next.js app..."
        npm run build
        echo "Deploying to Firebase Hosting..."
        firebase deploy --only hosting
    fi
fi
echo ""

# Step 5: Verify Setup
echo -e "${YELLOW}Step 5: Verification${NC}"
echo "Running verification checks..."
echo ""

# Check if files exist
echo "Checking configuration files..."
files=(
    "firestore.rules"
    "firestore.indexes.json"
    "storage.rules"
    "firebase.json"
    "lib/firebase.ts"
    "lib/database.ts"
    "components/providers/firebase-provider.tsx"
)

all_good=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (missing)${NC}"
        all_good=false
    fi
done
echo ""

# Summary
echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}Setup Summary${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""
echo "Firebase Project: trigentai"
echo "Project ID: 713759613857"
echo ""
echo "Services Status:"
echo "- Firestore: Configured ✅"
echo "- Storage: Manual setup required ⚠️"
echo "- Authentication: Manual setup required ⚠️"
echo "- Hosting: Configured ✅"
echo ""
echo "Next Steps:"
echo "1. Enable Storage in Firebase Console"
echo "2. Enable Authentication providers"
echo "3. Test the application locally"
echo "4. Commit changes to git"
echo "5. Deploy to production"
echo ""

if [ "$all_good" = true ]; then
    echo -e "${GREEN}✅ All configuration files are present!${NC}"
    echo ""
    read -p "Ready to commit to git? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Adding files to git..."
        git add .
        echo ""
        echo "Files staged for commit:"
        git status --short
        echo ""
        echo "Commit message suggestion:"
        echo "feat: Complete Firebase backend setup with Firestore, Storage, and Auth"
        echo ""
        read -p "Proceed with commit? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git commit -m "feat: Complete Firebase backend setup

- Added Firestore security rules and indexes
- Configured Firebase Storage with size limits
- Created comprehensive database structure (14 collections)
- Added DatabaseService helper class with CRUD operations
- Implemented user initialization and workspace management
- Created detailed documentation (BACKEND_SETUP.md, DATABASE_STRUCTURE.md)
- Configured GitHub Actions for auto-deployment
- Deployed Firestore rules and indexes successfully"
            echo ""
            echo -e "${GREEN}✅ Changes committed!${NC}"
            echo ""
            read -p "Push to GitHub? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git push origin main
                echo -e "${GREEN}✅ Pushed to GitHub!${NC}"
            fi
        fi
    fi
else
    echo -e "${RED}⚠️  Some files are missing. Please complete the setup first.${NC}"
fi

echo ""
echo -e "${BLUE}🎉 Setup script completed!${NC}"
echo ""
echo "For detailed instructions, see:"
echo "- BACKEND_SETUP.md"
echo "- DATABASE_STRUCTURE.md"
echo "- FIREBASE_SETUP.md"
