# Contributing to SkyPulse

Thanks for your interest in contributing to SkyPulse! Here's how to get started.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/skypulse.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Install dependencies: `make install`
5. Copy `.env.example` to `.env` and set `FLASK_SECRET_KEY`

## Development

```bash
make dev          # Start backend + frontend
make test         # Run all tests
make typecheck    # TypeScript strict check
make lint         # Lint frontend
```

## Pull Requests

- Keep PRs focused — one feature or fix per PR
- Add tests for new functionality
- Run `make test` and `make typecheck` before submitting
- Write a clear description of what changed and why

## Reporting Issues

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS if relevant

## Code Style

- **Backend**: Python 3.12+, PEP 8
- **Frontend**: TypeScript strict mode, no `any` types
- **Commits**: Use conventional prefixes (`feat:`, `fix:`, `refactor:`, etc.)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
