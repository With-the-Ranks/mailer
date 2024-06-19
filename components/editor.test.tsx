import { describe, expect, test, vi } from 'vitest'
import prisma from '@/lib/__mocks__/prisma';
import mockEmail from '@/lib/__mocks__/email';
import { mockPartialUser } from '@/lib/__mocks__/user';
import Editor from "@/components/editor";
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as serverActions from "@/lib/actions";
import { updateEmail } from "@/lib/actions";

vi.mock('@/lib/prisma');
vi.mock("@/lib/auth", () => ({
  getSession: vi.fn().mockResolvedValue(mockPartialUser()),
  withOrgAuth: vi.fn(),
  withEmailAuth: vi.fn(),
}))
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}))

describe('Editor', () => {  
  test('saving content in the editor should call updateEmail', async () => {
    const mockedEmail = mockEmail({});
    const mockUpdateEmail = vi.spyOn(serverActions, 'updateEmail');

    render(<Editor email={mockedEmail}/>);
    
    // trigger saving the email by pressing CMD + s
    await userEvent.keyboard('{Meta>}{s}{/Meta}');
    
    expect(mockUpdateEmail).toHaveBeenCalled();
  });

  test('updateEmail should update email content', async () => {
    const mockedOriginalEmail = mockEmail({});
    const mockedEmail = mockEmail({content: 'updated content!'});
    prisma.email.findUnique.mockResolvedValue(mockedOriginalEmail);
    prisma.email.update.mockResolvedValue(mockedEmail);

    const result = await updateEmail(mockedEmail, false);
    expect(result).toBeDefined();
    expect(result.content).toEqual('updated content!');
  });
});