import type { Email } from '@prisma/client'
import { faker } from '@faker-js/faker';
import mockOrganization from '@/lib/__mocks__/organization';


const getMockEmailDefaults = () => {
  const dateNow = new Date();
  return {
    id: '1',
    emailsTo: [],
    slug: 'test',
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
    published: true,
    title: 'Test Title',
    description: 'Description',
    image: null,
    imageBlurhash: null,
    organization: mockOrganization({}),
    organizationId: '1',
    userId: '1',
    template: null,
    key: 0,
    content: 'this is test content',
  }
}

const mockEmail = (email: Partial<Email>) => {
  const defaultEmail = getMockEmailDefaults();
  return {...defaultEmail, ...email};
}

export default mockEmail;