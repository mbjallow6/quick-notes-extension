#!/bin/bash

# =============================================================================
# Quick Notes Git & GitHub Automation Script
# =============================================================================
# This script automates the complete Git/GitHub workflow for feature development
# Usage: ./git-workflow.sh [command] [options]
# =============================================================================

set -e  # Exit on any error

# Configuration
MAIN_BRANCH="main"
FEATURE_PREFIX="feature/"
REMOTE_NAME="origin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not a git repository. Please run this script from your project root."
        exit 1
    fi
}

# Check if GitHub CLI is installed and authenticated
check_github_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed. Please install it first."
        exit 1
    fi
    
    if ! gh auth status &> /dev/null; then
        print_error "GitHub CLI is not authenticated. Please run 'gh auth login' first."
        exit 1
    fi
}

# Get current branch name
get_current_branch() {
    git branch --show-current
}

# Check if branch exists locally
branch_exists_locally() {
    git show-ref --verify --quiet "refs/heads/$1"
}

# Check if branch exists on remote
branch_exists_remotely() {
    git show-ref --verify --quiet "refs/remotes/$REMOTE_NAME/$1"
}

# =============================================================================
# MAIN WORKFLOW FUNCTIONS
# =============================================================================

# Start of day routine - sync everything
start_day() {
    print_header "Starting Development Day"
    
    # Ensure we're on main branch
    print_info "Switching to main branch..."
    git checkout $MAIN_BRANCH
    
    # Fetch all remote changes
    print_info "Fetching remote changes..."
    git fetch --all --prune
    
    # Pull latest changes from main
    print_info "Pulling latest changes from main..."
    git pull $REMOTE_NAME $MAIN_BRANCH
    
    # Clean up merged branches
    print_info "Cleaning up merged branches..."
    git branch --merged | grep -v "\*\|$MAIN_BRANCH" | xargs -n 1 git branch -d 2>/dev/null || true
    
    # Show current status
    print_info "Repository status:"
    git status --short
    
    print_success "Day started! Repository is up-to-date."
}

# Create a new feature branch
create_feature() {
    local feature_name=$1
    
    if [[ -z "$feature_name" ]]; then
        print_error "Feature name is required"
        echo "Usage: $0 feature <feature-name>"
        exit 1
    fi
    
    local branch_name="${FEATURE_PREFIX}${feature_name}"
    
    print_header "Creating Feature Branch: $branch_name"
    
    # Ensure we're on main and it's up-to-date
    print_info "Ensuring main branch is up-to-date..."
    git checkout $MAIN_BRANCH
    git pull $REMOTE_NAME $MAIN_BRANCH
    
    # Create and switch to feature branch
    if branch_exists_locally "$branch_name"; then
        print_warning "Branch $branch_name already exists locally. Switching to it..."
        git checkout "$branch_name"
    else
        print_info "Creating new branch: $branch_name"
        git checkout -b "$branch_name"
    fi
    
    print_success "Feature branch '$branch_name' is ready!"
    print_info "You can now start working on your feature."
}

# Save current work and push to remote
save_work() {
    local commit_message=${1:-"Work in progress"}
    local current_branch=$(get_current_branch)
    
    print_header "Saving Work on Branch: $current_branch"
    
    # Check if there are any changes to commit
    if ! git diff-index --quiet HEAD --; then
        print_info "Adding changes to staging..."
        git add -A
        
        print_info "Committing changes..."
        git commit -m "$commit_message"
        
        print_success "Changes committed locally."
    else
        print_info "No changes to commit."
    fi
    
    # Push to remote
    print_info "Pushing to remote..."
    if branch_exists_remotely "$current_branch"; then
        git push $REMOTE_NAME "$current_branch"
    else
        git push -u $REMOTE_NAME "$current_branch"
    fi
    
    print_success "Work saved and pushed to remote!"
}

# Create pull request for current branch
create_pr() {
    local current_branch=$(get_current_branch)
    local pr_title=${1:-"Feature: ${current_branch#$FEATURE_PREFIX}"}
    local pr_body=${2:-"This PR implements the ${current_branch#$FEATURE_PREFIX} feature."}
    
    print_header "Creating Pull Request"
    
    # Ensure branch is pushed
    save_work "Ready for review"
    
    # Create PR using GitHub CLI
    print_info "Creating pull request..."
    gh pr create \
        --title "$pr_title" \
        --body "$pr_body" \
        --base $MAIN_BRANCH \
        --head "$current_branch"
    
    print_success "Pull request created successfully!"
    
    # Show PR details
    gh pr view --web
}

# Complete feature (merge PR and cleanup)
complete_feature() {
    local current_branch=$(get_current_branch)
    
    print_header "Completing Feature: $current_branch"
    
    # Check if there's an open PR for this branch
    if ! gh pr view "$current_branch" &> /dev/null; then
        print_error "No open pull request found for branch $current_branch"
        print_info "Create a PR first with: $0 pr"
        exit 1
    fi
    
    # Merge the PR
    print_info "Merging pull request..."
    gh pr merge "$current_branch" --squash --delete-branch
    
    # Switch back to main and update
    print_info "Switching to main branch..."
    git checkout $MAIN_BRANCH
    git pull $REMOTE_NAME $MAIN_BRANCH
    
    # Clean up local branch
    if branch_exists_locally "$current_branch"; then
        print_info "Deleting local feature branch..."
        git branch -D "$current_branch"
    fi
    
    print_success "Feature completed and merged!"
}

# End of day routine
end_day() {
    local current_branch=$(get_current_branch)
    
    print_header "Ending Development Day"
    
    # Save any uncommitted work
    if ! git diff-index --quiet HEAD --; then
        print_info "Saving uncommitted work..."
        save_work "End of day save"
    fi
    
    # Show current status
    print_info "Current branch: $current_branch"
    print_info "Repository status:"
    git status --short
    
    # Show any open PRs
    print_info "Open pull requests:"
    gh pr list --state open
    
    print_success "Day ended! All work saved."
}

# Sync with remote (can be used anytime)
sync_repo() {
    local current_branch=$(get_current_branch)
    
    print_header "Syncing Repository"
    
    # Stash any uncommitted changes
    local stashed=false
    if ! git diff-index --quiet HEAD --; then
        print_info "Stashing uncommitted changes..."
        git stash push -m "Auto-stash before sync"
        stashed=true
    fi
    
    # Fetch and update main
    print_info "Fetching remote changes..."
    git fetch --all --prune
    
    git checkout $MAIN_BRANCH
    git pull $REMOTE_NAME $MAIN_BRANCH
    
    # Return to original branch and rebase if it's a feature branch
    if [[ "$current_branch" != "$MAIN_BRANCH" ]]; then
        git checkout "$current_branch"
        if [[ "$current_branch" == $FEATURE_PREFIX* ]]; then
            print_info "Rebasing feature branch on main..."
            git rebase $MAIN_BRANCH
        fi
    fi
    
    # Restore stashed changes
    if [[ "$stashed" == true ]]; then
        print_info "Restoring stashed changes..."
        git stash pop
    fi
    
    print_success "Repository synced successfully!"
}

# =============================================================================
# MAIN SCRIPT LOGIC
# =============================================================================

# Show usage information
show_usage() {
    echo "Quick Notes Git & GitHub Automation Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start                    - Start development day (sync with remote)"
    echo "  feature <name>           - Create new feature branch"
    echo "  save [message]           - Save and push current work"
    echo "  pr [title] [body]        - Create pull request"
    echo "  complete                 - Complete feature (merge PR and cleanup)"
    echo "  end                      - End development day"
    echo "  sync                     - Sync repository with remote"
    echo ""
    echo "Examples:"
    echo "  $0 start                 - Start your development day"
    echo "  $0 feature drag-drop     - Create feature/drag-drop branch"
    echo "  $0 save \"Add progress bar\" - Save work with custom message"
    echo "  $0 pr \"Add drag-drop\"    - Create PR with custom title"
    echo "  $0 complete              - Complete current feature"
    echo "  $0 end                   - End your development day"
}

# Main script execution
main() {
    # Check prerequisites
    check_git_repo
    check_github_cli
    
    # Parse command
    local command=$1
    shift
    
    case $command in
        "start")
            start_day
            ;;
        "feature")
            create_feature "$1"
            ;;
        "save")
            save_work "$1"
            ;;
        "pr")
            create_pr "$1" "$2"
            ;;
        "complete")
            complete_feature
            ;;
        "end")
            end_day
            ;;
        "sync")
            sync_repo
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    if [[ $# -eq 0 ]]; then
        show_usage
        exit 1
    fi
    main "$@"
fi
