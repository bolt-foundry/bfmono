# Sapling SCM Guide

## What is Sapling?

Sapling is a source control system developed by Meta, designed for large-scale
development. It's compatible with Git repositories while offering a more
streamlined workflow and better performance at scale.

## Key Differences from Git

### 1. Commit Model

- **Sapling**: Mutable commits, easy to amend and rebase
- **Git**: Immutable commits, requires more complex operations to modify history

### 2. Branch Model

- **Sapling**: Lightweight bookmarks instead of branches
- **Git**: Heavy branches with full history

### 3. UI/UX

- **Sapling**: Cleaner CLI with consistent commands
- **Git**: More complex command structure with many options

### 4. Performance

- **Sapling**: Optimized for large monorepos
- **Git**: Can slow down with very large repositories

## Essential Commands

### Basic Operations

```bash
# Check status
sl status

# Add files
sl add <file>
sl add .

# Add and remove files automatically
sl addremove

# Commit changes
sl commit -m "message"

# Amend last commit
sl amend
sl amend -m "new message"

# Show commit history
sl log
sl log -G  # graphical view
sl log --limit 10
```

### Working with Changes

```bash
# Diff changes
sl diff
sl diff --staged

# Revert changes
sl revert <file>
sl revert --all

# Clean untracked files
sl clean
```

### Stacking (Sapling's Killer Feature)

Sapling excels at managing stacked commits:

```bash
# Create a stack of commits
sl commit -m "feature: part 1"
sl commit -m "feature: part 2"
sl commit -m "feature: part 3"

# Amend any commit in the stack
sl goto <commit>
sl amend
sl rebase --restack  # automatically rebase descendants

# Or use interactive smartlog
sl isl  # opens interactive smartlog UI
```

### Navigation

```bash
# Go to a specific commit
sl goto <commit>
sl goto main

# Show where you are
sl whereami

# Show smartlog (visual commit graph)
sl smartlog
sl sl  # shorthand
```

### Bookmarks (Instead of Branches)

```bash
# Create bookmark
sl bookmark <name>

# List bookmarks
sl bookmarks

# Move bookmark
sl bookmark -r <commit> <name>

# Delete bookmark
sl bookmark -d <name>

# Push bookmark to remote
sl push -r . --to <bookmark>
```

### Working with Remote

```bash
# Pull changes
sl pull

# Push changes
sl push

# Push to specific remote bookmark
sl push --to main

# Fetch without updating
sl pull --rebase
```

### Rebasing and Conflicts

```bash
# Rebase current stack
sl rebase -d <destination>

# Interactive rebase
sl histedit

# Continue after resolving conflicts
sl rebase --continue

# Abort rebase
sl rebase --abort

# Restack after amending
sl rebase --restack
```

## Advanced Features

### 1. Interactive Smartlog (ISL)

```bash
sl isl
```

Opens a web-based UI for visualizing and manipulating commits.

### 2. Absorb

Automatically amend changes into the correct commits:

```bash
sl absorb
```

### 3. Split

Split a commit into multiple commits:

```bash
sl split
```

### 4. Fold

Combine multiple commits:

```bash
sl fold -r <commit> --from <commit>
```

### 5. Undo

Undo the last operation:

```bash
sl undo
```

## Best Practices

### 1. Use Stacked Commits

Break work into logical, reviewable chunks:

```bash
sl commit -m "refactor: extract utility function"
sl commit -m "feature: add new API endpoint"
sl commit -m "test: add tests for new endpoint"
```

### 2. Amend Freely

Don't fear modifying commits:

```bash
# Make changes
sl amend  # updates current commit
sl rebase --restack  # fixes any descendants
```

### 3. Keep Commits Small

- Each commit should do one thing
- Easy to review
- Easy to revert if needed

### 4. Use Descriptive Messages

```bash
sl commit -m "type: brief description

Longer explanation if needed.
- Bullet points for details
- Reference issue numbers"
```

### 5. Regular Rebasing

Keep your stack up to date:

```bash
sl pull --rebase
sl rebase -d main
```

## Common Workflows

### Feature Development

```bash
# Start from main
sl goto main
sl pull

# Create feature stack
sl commit -m "feat: add user model"
sl commit -m "feat: add user API"
sl commit -m "test: add user tests"

# Push for review
sl push --to my-feature
```

### Fixing Review Comments

```bash
# Go to specific commit
sl goto <commit-to-fix>

# Make changes and amend
sl amend

# Restack any dependent commits
sl rebase --restack

# Push updates
sl push --to my-feature
```

### Cleaning Up Before Merge

```bash
# Interactive history edit
sl histedit

# Or use absorb for automatic fixups
sl absorb

# Final push
sl push --to main
```

## Troubleshooting

### Resolving Conflicts

```bash
# During rebase/merge
# 1. Fix conflicts in files
# 2. Mark as resolved
sl resolve --mark <file>
# 3. Continue
sl rebase --continue
```

### Recovering Lost Work

```bash
# Show hidden commits
sl log --hidden

# Undo last operation
sl undo

# Unhide a commit
sl unhide <commit>
```

### Checking Repository Health

```bash
# Verify repository
sl doctor

# Clean up repository
sl purge --cleanup
```

## Git Interoperability

Sapling works with Git repositories:

```bash
# Clone a Git repo
sl clone <git-url>

# Work normally with Sapling commands
sl status
sl commit
sl push

# Git tools still work
git log  # if needed
```

## Configuration

### User Configuration

```bash
# Set user name and email
sl config ui.username "Your Name <email@example.com>"

# Enable features
sl config --user isl.server true  # enable ISL
sl config --user amend.autorestack true  # auto-restack on amend
```

### Useful Aliases

Add to `~/.config/sapling/sapling.conf`:

```ini
[alias]
s = status
d = diff
c = commit
a = amend
l = log -G --limit 10
```

## Tips and Tricks

1. **Use `sl sl` (smartlog)** - Visual representation of your commit stack
2. **Embrace amending** - Don't create fixup commits, just amend
3. **Use ISL for complex operations** - Visual UI makes rebasing easier
4. **Learn absorb** - Automatically puts changes in the right commits
5. **Use `addremove`** - Automatically handles moved/deleted files
6. **Review with `sl diff --since`** - See all changes in your stack

## Migration from Git

For developers coming from Git:

| Git Command       | Sapling Equivalent      |
| ----------------- | ----------------------- |
| `git status`      | `sl status`             |
| `git add`         | `sl add`                |
| `git commit`      | `sl commit`             |
| `git log`         | `sl log`                |
| `git branch`      | `sl bookmarks`          |
| `git checkout`    | `sl goto`               |
| `git pull`        | `sl pull`               |
| `git push`        | `sl push`               |
| `git rebase`      | `sl rebase`             |
| `git merge`       | Not needed (use rebase) |
| `git stash`       | `sl shelve`             |
| `git cherry-pick` | `sl graft`              |

## Resources

- [Official Sapling Documentation](https://sapling-scm.com/)
- [Sapling GitHub Repository](https://github.com/facebook/sapling)
- Interactive tutorial: `sl help tutorial`
