import type { Organization } from '@prisma/client'
import { faker } from '@faker-js/faker';

const getMockOrganizationDefaults = () => {
    const dateNow = new Date();
    return {
        id: 1,
        name: 'Test Org',
        description: null,
        logo: null,
        font: null,
        image: null,
        imageBlurhash: null,
        subdomain: 'test',
        customDomain: 'test.com',
        message404: null,
        createdAt: dateNow,
        updatedAt: dateNow,
        users: ['1'],
        emails: []
    }
}

const mockOrganization = (organization: Partial<Organization>) => {
    const defaultOrg = getMockOrganizationDefaults();
    return { ...defaultOrg, ...organization };
}

export default mockOrganization;