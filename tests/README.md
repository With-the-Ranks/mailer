# Tests

## Mailer Testing Guidelines

- Unit Testing

  - Write these as needed when adding new key components + functionality
  - For frontend unit testing of React components - use [Vitest](https://vitest.dev) (with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro))
  - For backend unit testing - use [Vitest](https://vitest.dev)

- Integration Testing

  - Write these as needed for testing important interactions between components
  - Use [Vitest](https://vitest.dev)

- End-to-End Testing
  - Use sparingly, required only for the most important app pathways (ex. onboarding flow, email sending flow)
  - Use [Playwright](https://playwright.dev/)

## Test Locations

- E2E tests should go in this folder
- Unit tests should go in the same folder as what they're testing (ex. see [`components/form/form-button.test.tsx`](https://github.com/With-the-Ranks/mailer/blob/715e9dddf9b55cbc050c2fd85f02942ebebfdede/components/form/form-button.test.tsx) )
