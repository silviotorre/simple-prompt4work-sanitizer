# Security Policy

## Security boundary

Prompt4Work Sanitizer is a local-first browser utility intended to help remove or flag selected sensitive patterns before work prompts are shared with external systems.

It is **not** a DLP, classification, declassification, or compliance product.

Its security boundary is intentionally explicit:

- sanitization logic runs in the browser;
- configured replacement and red-flag rules cover only known patterns;
- diagnostics report what the tool recognized, not everything that may be sensitive;
- successful sanitization does not make a prompt automatically safe to disclose;
- business context, proprietary logic, personal data, internal names, or other confidential information may remain even when no red flag is raised.

## Safe-use expectations

Before sharing output:

1. review all diagnostics and warnings;
2. inspect the full sanitized prompt manually;
3. treat unknown or ambiguous content conservatively;
4. test new rules with synthetic data rather than production secrets;
5. keep organization-specific rule sets under appropriate change control.

## Vulnerability reporting

Relevant security defects include unintended data transmission, unsafe rendering of user-controlled content, rule-processing bypasses that materially contradict documented behavior, or vulnerabilities introduced through deployment dependencies.

Do not publish real credentials, confidential prompts, customer data, or proprietary code in a GitHub issue.

For issues reproducible with synthetic data, open a focused GitHub issue containing minimal reproduction steps, expected behavior, actual behavior, and browser/runtime information where relevant.

If sensitive material is required to explain the report, contact the maintainer through the public contact channels listed on the GitHub profile instead of posting that material publicly.

## Dependency and deployment model

The application is intentionally small and browser-oriented. Security review should concentrate on rule loading, regex handling, Markdown/HTML rendering, browser-side data flow, and changes to build or GitHub Pages deployment dependencies.
