"use server";

import type { Email, Organization } from "@prisma/client";
import { put } from "@vercel/blob";
import { customAlphabet } from "nanoid";
import { revalidateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

import { getSession } from "@/lib/auth";
import {
  addDomainToVercel,
  // getApexDomain,
  removeDomainFromVercelProject,
  // removeDomainFromVercelTeam,
  validDomainRegex,
} from "@/lib/domains";
import prisma from "@/lib/prisma";
import { seedOrgTemplates } from "@/lib/seedTemplates";
import { getBlurDataURL } from "@/lib/utils";

import { withEmailAuth, withOrgAuth } from "../auth";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

export const createOrganization = async (formData: FormData) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const subdomain = formData.get("subdomain") as string;

  try {
    const response = await prisma.organization.create({
      data: {
        name,
        description,
        subdomain,
      },
    });

    try {
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          organizationId: response.id,
        },
      });
    } catch (error: any) {
      console.log(error);
    }

    await seedOrgTemplates(response.id);

    await revalidateTag(
      `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
    );
    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `This subdomain is already taken`,
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};

export const updateOrganization = withOrgAuth(
  async (formData: FormData, organization: Organization, key: string) => {
    const value = formData.get(key) as string;

    try {
      let response;
      if (key === "emailApiKey") {
        const resp = await new Resend(
          value || process.env.RESEND_API_KEY!,
        ).domains.list();
        const raw = (resp as any).data?.data ?? [];
        const newIds = raw.map((d: any) => d.id);

        await Promise.all(
          raw.map((d: any) =>
            prisma.emailDomain.upsert({
              where: { id: d.id },
              create: {
                id: d.id,
                providerId: d.id,
                domain: d.name,
                status: d.status,
                organizationId: organization.id,
              },
              update: { domain: d.name, status: d.status },
            }),
          ),
        );
        await prisma.emailDomain.deleteMany({
          where: {
            organizationId: organization.id,
            id: { notIn: newIds },
          },
        });

        const pick =
          organization.activeDomainId &&
          newIds.includes(organization.activeDomainId)
            ? organization.activeDomainId
            : newIds[0] ?? null;

        const finalOrg = await prisma.organization.update({
          where: { id: organization.id },
          data: {
            emailApiKey: value || null,
            activeDomainId: pick,
          },
          include: { activeDomain: true },
        });

        revalidatePath(`/organization/${organization.id}/settings`);
        return finalOrg;
      }
      if (key === "customDomain") {
        if (value.includes("vercel.pub")) {
          return {
            error: "Cannot use vercel.pub subdomain as your custom domain",
          };

          // if the custom domain is valid, we need to add it to Vercel
        } else if (validDomainRegex.test(value)) {
          response = await prisma.organization.update({
            where: {
              id: organization.id,
            },
            data: {
              customDomain: value,
            },
          });
          await Promise.all([
            addDomainToVercel(value),
            // Optional: add www subdomain as well and redirect to apex domain
            // addDomainToVercel(`www.${value}`),
          ]);

          // empty value means the user wants to remove the custom domain
        } else if (value === "") {
          response = await prisma.organization.update({
            where: {
              id: organization.id,
            },
            data: {
              customDomain: null,
            },
          });
        }

        // if the organization had a different customDomain before, we need to remove it from Vercel
        if (organization.customDomain && organization.customDomain !== value) {
          response = await removeDomainFromVercelProject(
            organization.customDomain,
          );

          /* Optional: remove domain from Vercel team 

          // first, we need to check if the apex domain is being used by other organizations
          const apexDomain = getApexDomain(`https://${organization.customDomain}`);
          const domainCount = await prisma.organization.count({
            where: {
              OR: [
                {
                  customDomain: apexDomain,
                },
                {
                  customDomain: {
                    endsWith: `.${apexDomain}`,
                  },
                },
              ],
            },
          });

          // if the apex domain is being used by other organizations
          // we should only remove it from our Vercel project
          if (domainCount >= 1) {
            await removeDomainFromVercelProject(organization.customDomain);
          } else {
            // this is the only organization using this apex domain
            // so we can remove it entirely from our Vercel team
            await removeDomainFromVercelTeam(
              organization.customDomain
            );
          }
          
          */
        }
      } else if (key === "image" || key === "logo") {
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          return {
            error:
              "Missing BLOB_READ_WRITE_TOKEN token. Note: Vercel Blob is currently in beta – please fill out this form for access: https://tally.so/r/nPDMNd",
          };
        }

        const file = formData.get(key) as File;
        const filename = `${nanoid()}.${file.type.split("/")[1]}`;

        const { url } = await put(filename, file, {
          access: "public",
        });

        const blurhash = key === "image" ? await getBlurDataURL(url) : null;

        response = await prisma.organization.update({
          where: {
            id: organization.id,
          },
          data: {
            [key]: url,
            ...(blurhash && { imageBlurhash: blurhash }),
          },
        });
      } else {
        response = await prisma.organization.update({
          where: {
            id: organization.id,
          },
          data: {
            [key]: value,
          },
        });
      }
      console.log(
        "Updated organization data! Revalidating tags: ",
        `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
        `${organization.customDomain}-metadata`,
      );
      await revalidateTag(
        `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );
      organization.customDomain &&
        (await revalidateTag(`${organization.customDomain}-metadata`));

      return response;
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          error: `This ${key} is already taken`,
        };
      } else {
        return {
          error: error.message,
        };
      }
    }
  },
);

export const deleteOrganization = withOrgAuth(
  async (_: FormData, organization: Organization) => {
    try {
      const response = await prisma.organization.delete({
        where: {
          id: organization.id,
        },
      });
      await revalidateTag(
        `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );
      response.customDomain &&
        (await revalidateTag(`${organization.customDomain}-metadata`));
      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  },
);

export const getOrganizationFromEmailId = async (emailId: string) => {
  const email = await prisma.email.findUnique({
    where: {
      id: emailId,
    },
    select: {
      organizationId: true,
    },
  });
  return email?.organizationId;
};

export const getOrganizationFromUserId = async () => {
  const session = await getSession();
  if (!session?.user.id) return null;

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      organizationId: true,
    },
  });

  return user?.organizationId;
};

export const getOrganizationFromAudienceId = async (audienceId: string) => {
  const audience = await prisma.audienceList.findUnique({
    where: {
      id: audienceId,
    },
    select: {
      organizationId: true,
    },
  });
  return audience?.organizationId;
};

export const createEmail = async (
  campaignName: string | null,
  organizationId: string,
  selectedAudienceList: string | null,
  template: string | null,
  content?: string,
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }

  // Ensure audienceListId is not null
  if (!selectedAudienceList) {
    return { error: "Invalid audience list." };
  }

  // Validate campaignName
  if (!campaignName || typeof campaignName !== "string") {
    return { error: "Invalid campaign name." };
  }

  try {
    // Create email in Prisma
    const response = await prisma.email.create({
      data: {
        organizationId,
        userId: session.user.id,
        title: campaignName || "New Campaign",
        subject: campaignName || "New Campaign",
        audienceListId: selectedAudienceList,
        template,
        content,
      },
    });

    return response;
  } catch (error) {
    return { error: "An error occurred while creating the email." };
  }
};

// creating a separate function for this because we're not using FormData
export const updateEmail = async (data: Email, scheduledTime?: Date | null) => {
  const session = await getSession();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }

  const email = await prisma.email.findUnique({
    where: { id: data.id },
    include: { organization: true },
  });
  if (!email || email.userId !== session.user.id) {
    return { error: "Email not found" };
  }

  const updateData: any = {
    title: data.title,
    description: data.description,
    content: data.content,
    previewText: data.previewText,
    subject: data.subject,
  };

  if (scheduledTime !== undefined) {
    updateData.scheduledTime = scheduledTime;
  }

  try {
    const response = await prisma.email.update({
      where: { id: data.id },
      data: updateData,
    });

    await revalidateTag(
      `${email.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-emails`,
    );
    await revalidateTag(
      `${email.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${email.slug}`,
    );
    if (email.organization?.customDomain) {
      await revalidateTag(`${email.organization.customDomain}-emails`);
      await revalidateTag(`${email.organization.customDomain}-${email.slug}`);
    }

    return response;
  } catch (err: any) {
    return { error: err.message };
  }
};

export const updatePostMetadata = withEmailAuth(
  async (
    formData: FormData,
    email: Email & {
      organization: Organization;
    },
    key: string,
  ) => {
    const value = formData.get(key) as string;

    try {
      let response;
      if (key === "image") {
        const file = formData.get("image") as File;
        const filename = `${nanoid()}.${file.type.split("/")[1]}`;

        const { url } = await put(filename, file, {
          access: "public",
        });

        const blurhash = await getBlurDataURL(url);

        response = await prisma.email.update({
          where: {
            id: email.id,
          },
          data: {
            image: url,
            imageBlurhash: blurhash,
          },
        });
      } else {
        response = await prisma.email.update({
          where: {
            id: email.id,
          },
          data: {
            [key]: key === "published" ? value === "true" : value,
          },
        });
      }

      await revalidateTag(
        `${email.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-emails`,
      );
      await revalidateTag(
        `${email.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${email.slug}`,
      );

      // if the organization has a custom domain, we need to revalidate those tags too
      email.organization?.customDomain &&
        (await revalidateTag(`${email.organization?.customDomain}-emails`),
        await revalidateTag(
          `${email.organization?.customDomain}-${email.slug}`,
        ));

      return response;
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          error: `This slug is already in use`,
        };
      } else {
        return {
          error: error.message,
        };
      }
    }
  },
);

export const deleteEmail = withEmailAuth(async (_: FormData, email: Email) => {
  try {
    const response = await prisma.email.delete({
      where: {
        id: email.id,
      },
      select: {
        organizationId: true,
      },
    });
    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
});

export const editUser = async (
  formData: FormData,
  _id: unknown,
  key: string,
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  const value = formData.get(key) as string;

  try {
    const response = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        [key]: value,
      },
    });
    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `This ${key} is already in use`,
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};

export const fetchAudienceLists = async (organizationId: string) => {
  try {
    const audienceLists = await prisma.audienceList.findMany({
      where: { organizationId },
      include: {
        audiences: true,
      },
    });

    return audienceLists.map((list) => ({
      id: list.id,
      name: list.name,
      contactCount: list.audiences.length,
    }));
  } catch (error) {
    console.error("Error fetching audience lists:", error);
    throw new Error("Failed to fetch audience lists");
  }
};
