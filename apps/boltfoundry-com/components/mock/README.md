# Mock Components

Mock implementations for development, testing, and demonstration.

## Purple Theme

Routes containing `/mock/` automatically get purple styling:

- Navigation background: `rgba(238, 130, 238, 0.15)`
- Logo color: `rgba(238, 130, 238, 1)`

## Structure

```
mock/
├── {feature}/
│   ├── README.md      # Feature documentation
│   ├── components/    # Mock components
│   └── mocks/        # Static data
```

## Creating Mocks

1. Use `/mock/{feature}/` route pattern
2. Static data only (no persistence)
3. Mirror production UX
4. Include feature README with usage guide

## Current Mocks

- **eval/**: Evaluation interface with grading workflows
