import { describe, expect, test, vi } from 'vitest'
import { faker } from '@faker-js/faker';
import prisma from '@/lib/__mocks__/prisma';
import mockEmail from '@/lib/__mocks__/email';
import mockUser, { mockPartialUser } from '@/lib/__mocks__/user';
import { revalidateTag } from "next/cache";
import Editor, { EmailWithSite } from "@/components/editor";
import { fireEvent, getByTestId, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as serverActions from "@/lib/actions";
import { createEmail, updateEmail } from "@/lib/actions";
import { withEmailAuth, getSession } from '@/lib/auth';

vi.mock('@/lib/prisma');
vi.mock("@/lib/auth", () => ({
  getSession: vi.fn().mockResolvedValue(mockPartialUser()),
  withOrgAuth: vi.fn(),
  withEmailAuth: vi.fn(),
}))
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}))

const createUserData = () => {
  const userData = new FormData();
  userData.append("email", faker.internet.email());
  userData.append("password", faker.internet.password());
  return userData;     
}

const createOrganizationData = () => {
  const orgData = new FormData();
  orgData.append("name", faker.company.name());
  orgData.append("description", faker.company.buzzPhrase());
  orgData.append("subdomain", faker.company.name());
  return orgData;
}

describe('Editor', () => {  
  test('saving content in the editor should call updateEmail', async () => {
    const mockedEmail = mockEmail({});
    const mockUpdateEmail = vi.spyOn(serverActions, 'updateEmail').mockResolvedValueOnce(mockedEmail);

    await render(<Editor email={mockedEmail}/>);
    
    // trigger saving the email by pressing CMD + s
    await userEvent.keyboard('{Meta>}{s}{/Meta}');
    
    await waitFor(() => expect(mockUpdateEmail).toHaveBeenCalled());
  });

  test('updateEmail should update email appropriately', async () => {
    const mockedOriginalEmail = mockEmail({});
    const mockedEmail = mockEmail({content: 'updated content!'});
    prisma.email.findUnique.mockResolvedValue(mockedOriginalEmail);
    prisma.email.update.mockResolvedValue(mockedEmail);

    const result = await updateEmail(mockedEmail, false);
    expect(result).toBeDefined();
    expect(result.content).toEqual('updated content!');
  });
});