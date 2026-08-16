# Security Policy

## Reporting a vulnerability

Please do not disclose security vulnerabilities through a public issue. Use GitHub's private vulnerability reporting under the repository's **Security** tab when available; otherwise contact the repository owner privately through their GitHub profile. Include affected routes, reproduction steps, impact, and any suggested mitigation. Avoid including real participant data in the report.

You should receive an acknowledgement before details are published. There is currently no bug-bounty program.

## Supported version

Security fixes target the latest revision of the default branch. Older commits and third-party forks are not maintained.

## Secrets and personal data

- Never commit `.env` files, Supabase secret keys, Gmail app passwords, or session tokens.
- Rotate a credential immediately if it appears in Git history, logs, screenshots, or an issue.
- Use synthetic data in development and tests.
- Treat registration names, email addresses, answers, and cancellation tokens as private data.
