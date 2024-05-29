import { describe, expect, test, vi } from 'vitest';
import { sendEmail } from '@/lib/actions/send-email';

vi.mock('resend', () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: vi.fn((emailDetails) => {
          if (emailDetails.to[0] === 'test@example.com') {
            return Promise.resolve({ data: { message: 'Email sent successfully' }, error: null });
          } else {
            return Promise.resolve({ data: null, error: 'Failed to send email' });
          }
        })
      }
    }))
  };
});

describe('sendEmail Functionality', () => {
  const email = 'test@example.com';
  const from = 'noreply@example.com';
  const subject = 'Welcome!';

  test('sendEmail should successfully send an email', async () => {
    const result = await sendEmail({ email, from, subject });
    expect(result.error).toBeUndefined();
    expect(result.data).toEqual({ message: 'Email sent successfully' });
  });

  test('sendEmail should handle failure in sending email', async () => {
    const result = await sendEmail({ email: 'fail@example.com', from, subject });
    expect(result.data).toBeUndefined();
    expect(result.error).toBe('Failed to send email');
  });
});
