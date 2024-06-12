import type { User } from "@prisma/client";
import { faker } from "@faker-js/faker";

const getMockUserDefaults = () => {
  const dateNow = new Date();
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    username: faker.internet.userName(),
    gh_username: null,
    email: faker.internet.email(),
    password: faker.internet.password(),
    emailVerified: dateNow,
    image: null,
    createdAt: dateNow,
    updatedAt: dateNow,
  };
};

const mockUser = (user: Partial<User>) => {
  const defaultUser = getMockUserDefaults();
  return { ...defaultUser, ...user };
};

export default mockUser;
