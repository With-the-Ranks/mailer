import type { User } from '@prisma/client'
import { faker } from '@faker-js/faker';

const getMockUserDefaults = () => {
  const dateNow = new Date()
  return {
    id: '1',
    name: faker.person.fullName(),
    username: faker.internet.userName(),
    gh_username: null,
    email: 'test@test.com',
    password: faker.internet.password(),
    emailVerified: dateNow,
    image: null,
    createdAt: dateNow,
    updatedAt: dateNow,
    organizationId: '1',
  }
}

export const mockPartialUser = () => {
  return {
    user: {
      id: '1',
      name: faker.person.fullName(),
      username: faker.internet.userName(),
      email: 'test@test.com',
      image: ''
    }
  }
}

const mockUser = (user: Partial<User>) => {
  const defaultUser = getMockUserDefaults()
  return {...defaultUser, ...user}
}

export default mockUser