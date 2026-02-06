"use server";

import type { Email, Organization } from "@/prisma/generated/prisma/client";
import { put } from "@vercel/blob";
import { customAlphabet } from "nanoid";
import { revalidateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

import { getSession, getUserOrgRole } from "@/lib/auth";
import {
  addDomainToVercel,
  // getApexDomain,
  removeDomainFromVercelProject,
  // removeDomainFromVercelTeam,
  validDomainRegex,
} from "@/lib/domains";
import prisma from "@/lib/prisma";
// import { seedOrgTemplates } from "@/lib/seedTemplates";
import { getBlurDataURL, logError } from "@/lib/utils";

import { withAdminAuth, withEmailAuth } from "../auth";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

export const createOrganization = async (
  formData: FormData,
  userId?: string,
) => {
  let uid = userId;
  if (!uid) {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }
    uid = session.user.id;
  }
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  // const subdomain = formData.get("subdomain") as string;

  try {
    const response = await prisma.organization.create({
      data: {
        name,
        description,
      },
    });

    try {
      // Create organization member record with ADMIN role
      await (prisma as any).organizationMember.create({
        data: {
          userId: uid,
          organizationId: response.id,
          role: "ADMIN",
        },
      });

      // Update user with legacy organizationId and set as current organization
      await prisma.user.update({
        where: {
          id: uid,
        },
        data: {
          organizationId: response.id,
          currentOrganizationId: response.id,
        },
      });
    } catch (error: any) {
      logError("Failed to attach org to user", error);
    }

    //await seedOrgTemplates(response.id);

    // await revalidateTag(
    //   `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
    // );
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

export const updateOrganization = withAdminAuth(
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
            : (newIds[0] ?? null);

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
      // Intentionally not logging details here in production
      revalidateTag(
        `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
        "page",
      );
      if (organization.customDomain) {
        revalidateTag(`${organization.customDomain}-metadata`, "page");
      }

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

export const deleteOrganization = withAdminAuth(
  async (_: FormData, organization: Organization) => {
    try {
      const response = await prisma.organization.delete({
        where: {
          id: organization.id,
        },
      });
      revalidateTag(
        `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
        "page",
      );
      if (response.customDomain) {
        revalidateTag(`${response.customDomain}-metadata`, "page");
      }
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
  template: string | null,
  content?: string,
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
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
        template,
        content,
      },
    });

    return response;
  } catch {
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
    from: data.from,
    replyTo: data.replyTo,
  };

  if (scheduledTime !== undefined && scheduledTime !== null) {
    updateData.scheduledTime = scheduledTime;
  }
  if ("template" in data) {
    updateData.template =
      (data as { template?: string | null }).template ?? null;
  }

  try {
    const response = await prisma.email.update({
      where: { id: data.id },
      data: updateData,
    });

    revalidateTag(
      `${email.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-emails`,
      "page",
    );
    revalidateTag(
      `${email.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${email.slug}`,
      "page",
    );
    if (email.organization?.customDomain) {
      revalidateTag(`${email.organization.customDomain}-emails`, "page");
      revalidateTag(`${email.organization.customDomain}-${email.slug}`, "page");
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

      revalidateTag(
        `${email.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-emails`,
        "page",
      );
      revalidateTag(
        `${email.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${email.slug}`,
        "page",
      );

      // if the organization has a custom domain, we need to revalidate those tags too
      if (email.organization?.customDomain) {
        revalidateTag(`${email.organization.customDomain}-emails`, "page");
        revalidateTag(
          `${email.organization.customDomain}-${email.slug}`,
          "page",
        );
      }

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

    return audienceLists.map(
      (list: { id: string; name: string; audiences: { id: string }[] }) => ({
        id: list.id,
        name: list.name,
        contactCount: list.audiences.length,
      }),
    );
  } catch (error) {
    logError("Error fetching audience lists", error);
    throw new Error("Failed to fetch audience lists");
  }
};

export const getOrgAndAudienceList = async () => {
  const session = await getSession();
  if (!session?.user.id) return null;

  const user: any = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      organizationId: true,
      currentOrganizationId: true,
      organization: {
        select: {
          audienceLists: {
            select: { id: true, name: true },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  // Fetch user's organizations via OrganizationMember
  const userOrganizations = await (prisma as any).organizationMember.findMany({
    where: { userId: session.user.id },
    include: {
      organization: {
        select: { id: true, name: true },
      },
    },
  });

  // Legacy migration: If user has organizationId but no OrganizationMember record, create one
  if (user?.organizationId && userOrganizations.length === 0) {
    try {
      await (prisma as any).organizationMember.create({
        data: {
          userId: session.user.id,
          organizationId: user.organizationId,
          role: "ADMIN", // Original org owner is admin
        },
      });

      // Update currentOrganizationId if not set
      if (!user.currentOrganizationId) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { currentOrganizationId: user.organizationId },
        });
      }

      // Refetch organizations after creating the member record
      const updatedUserOrgs = await (prisma as any).organizationMember.findMany(
        {
          where: { userId: session.user.id },
          include: {
            organization: {
              select: { id: true, name: true },
            },
          },
        },
      );

      const userOrgs = updatedUserOrgs.map((member: any) => ({
        id: member.organization.id,
        name: member.organization.name,
        role: member.role,
      }));

      const currentOrgId = user.currentOrganizationId || user.organizationId;

      return {
        currentOrgId,
        userOrgs,
        defaultAudienceId: user.organization?.audienceLists?.[0]?.id || null,
      };
    } catch (error) {
      console.error("Error creating legacy organization member:", error);
    }
  }

  const userOrgs = userOrganizations.map((member: any) => ({
    id: member.organization.id,
    name: member.organization.name,
    role: member.role,
  }));

  // Determine current org - prefer currentOrganizationId, fall back to organizationId
  const currentOrgId = user?.currentOrganizationId || user?.organizationId;

  if (!currentOrgId) {
    return { orgId: null, audienceListId: null, userOrgs, userRole: null };
  }

  // Fetch user's role for the current organization
  const currentRole = await getUserOrgRole(session.user.id, currentOrgId);

  // Fetch current organization's first audience list
  const currentOrg = await prisma.organization.findUnique({
    where: { id: currentOrgId },
    select: {
      audienceLists: {
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  const audienceListId = currentOrg?.audienceLists[0]?.id ?? null;

  return {
    orgId: currentOrgId,
    audienceListId,
    userOrgs,
    userRole: currentRole || null,
  };
};

// SES Domain Management Actions

import {
  addSesDomain as addSesDomainToAws,
  verifySesDomain as verifySesDomainInAws,
  deleteSesDomain as deleteSesDomainFromAws,
} from "@/lib/aws/ses-domain";

const MAX_DOMAINS_PER_ORG = 3;

//Add a domain to SES and get DNS records for verification

export const addSesDomain = async (
  domain: string,
  organizationId: string,
  awsRegion?: string,
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }

  const role = await getUserOrgRole(session.user.id, organizationId);
  if (!role || role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  try {
    // Check domain limit for organization
    const domainCount = await prisma.emailDomain.count({
      where: { organizationId },
    });

    if (domainCount >= MAX_DOMAINS_PER_ORG) {
      return {
        error: `Maximum of ${MAX_DOMAINS_PER_ORG} domains allowed per organization. Delete an existing domain to add a new one.`,
      };
    }

    // Check if domain already exists
    const existingDomain = await prisma.emailDomain.findUnique({
      where: { domain },
    });

    if (existingDomain) {
      return { error: "Domain already exists" };
    }

    // Add domain to SES
    const result = await addSesDomainToAws(domain, awsRegion);

    if (!result.success) {
      return { error: result.error || "Failed to add domain to SES" };
    }

    // Create domain record in database
    const emailDomain = await prisma.emailDomain.create({
      data: {
        domain,
        providerId: domain, // Use domain as providerId for SES
        provider: "ses",
        status: "PENDING",
        organizationId,
        awsRegion: awsRegion || "us-east-1",
        dkimPublicKey: result.publicKey,
        dkimSelector: "mailer",
      },
    });

    return {
      success: true,
      domain: emailDomain,
      dnsRecords: result.dnsRecords,
    };
  } catch (error: unknown) {
    logError("Error adding SES domain", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { error: errorMessage };
  }
};

// Verify a domain's status in SES

export const verifySesDomain = async (domainId: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }

  try {
    // Get domain from database
    const emailDomain = await prisma.emailDomain.findUnique({
      where: { id: domainId },
      include: { organization: true },
    });

    if (!emailDomain) {
      return { error: "Domain not found" };
    }

    // Verify user has access to the organization
    const role = await getUserOrgRole(
      session.user.id,
      emailDomain.organizationId,
    );
    if (!role) {
      return { error: "Not authorized" };
    }

    // Check verification status in SES
    const result = await verifySesDomainInAws(
      emailDomain.domain,
      emailDomain.awsRegion || undefined,
    );

    if (result.error) {
      return { error: result.error };
    }

    // Update domain status in database
    const newStatus = result.verified ? "SUCCESS" : "PENDING";
    await prisma.emailDomain.update({
      where: { id: domainId },
      data: {
        status: newStatus,
        dkimStatus: result.dkimStatus,
        spfStatus: result.spfStatus,
      },
    });

    // Return only serializable data (Prisma objects can break server action serialization)
    return {
      success: true,
      verified: result.verified,
      dkimStatus: result.dkimStatus ?? undefined,
      spfStatus: result.spfStatus ?? undefined,
    };
  } catch (error: unknown) {
    logError("Error verifying SES domain", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { error: errorMessage };
  }
};

// Delete a domain from SES

export const deleteSesDomain = async (domainId: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }

  try {
    // Get domain from database
    const emailDomain = await prisma.emailDomain.findUnique({
      where: { id: domainId },
    });

    if (!emailDomain) {
      return { error: "Domain not found" };
    }

    // Verify user has access to the organization
    const role = await getUserOrgRole(
      session.user.id,
      emailDomain.organizationId,
    );
    if (!role || role !== "ADMIN") {
      return { error: "Not authorized - admin access required" };
    }

    // Only delete from SES if it's an SES domain
    if (emailDomain.provider === "ses") {
      const result = await deleteSesDomainFromAws(
        emailDomain.domain,
        emailDomain.awsRegion || undefined,
      );

      if (!result.success) {
        // Log but don't fail - continue with database deletion
        logError("Failed to delete domain from SES", null, {
          domain: emailDomain.domain,
          error: result.error,
        });
      }
    }

    // Check if this domain is the active domain for the organization
    const org = await prisma.organization.findFirst({
      where: { activeDomainId: domainId },
    });

    if (org) {
      // Clear the active domain
      await prisma.organization.update({
        where: { id: org.id },
        data: { activeDomainId: null },
      });
    }

    // Delete domain from database
    await prisma.emailDomain.delete({
      where: { id: domainId },
    });

    revalidatePath(`/organization/${emailDomain.organizationId}/settings`);
    revalidatePath(
      `/organization/${emailDomain.organizationId}/settings/domains`,
    );

    return { success: true };
  } catch (error: unknown) {
    logError("Error deleting SES domain", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { error: errorMessage };
  }
};

// Set the active email domain for an organization

export const setActiveDomain = async (
  organizationId: string,
  domainId: string | null,
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }

  const role = await getUserOrgRole(session.user.id, organizationId);
  if (!role || role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  try {
    // If setting a domain, verify it belongs to the organization
    if (domainId) {
      const domain = await prisma.emailDomain.findFirst({
        where: {
          id: domainId,
          organizationId,
        },
      });

      if (!domain) {
        return {
          error: "Domain not found or does not belong to this organization",
        };
      }
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: organizationId },
      data: { activeDomainId: domainId },
      include: { activeDomain: true },
    });

    revalidatePath(`/organization/${organizationId}/settings`);

    return { success: true, organization: updatedOrg };
  } catch (error: unknown) {
    logError("Error setting active domain", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { error: errorMessage };
  }
};

// SNS & SES Configuration Actions

import {
  setupSnsForSes,
  setupAllConfigurationSets,
} from "@/lib/aws/ses-config";

// Initialize SES infrastructure for a region (admin only)
export const initializeSesRegion = async (
  region: string,
  callbackUrl: string,
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }

  const userWithOrgs = await prisma.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      role: "ADMIN",
    },
  });

  if (!userWithOrgs) {
    return { error: "Not authorized" };
  }

  try {
    // Check if region already initialized
    const existing = await prisma.sesRegionSettings.findUnique({
      where: { region },
    });

    if (existing) {
      return {
        success: true,
        message: "Region already initialized",
        settings: existing,
      };
    }

    // Setup SNS topic
    const snsResult = await setupSnsForSes(region, callbackUrl);
    if (!snsResult.success || !snsResult.topicArn) {
      return { error: snsResult.error || "Failed to create SNS topic" };
    }

    // Setup configuration sets
    const configResult = await setupAllConfigurationSets(
      snsResult.topicArn,
      region,
    );

    if (configResult.errors.length > 0) {
      logError("Some config sets failed to create", null, {
        errors: configResult.errors,
      });
    }

    // Save region settings
    const settings = await prisma.sesRegionSettings.create({
      data: {
        region,
        topicArn: snsResult.topicArn,
        configGeneral: configResult.configGeneral,
        configClick: configResult.configClick,
        configOpen: configResult.configOpen,
        configFull: configResult.configFull,
      },
    });

    return {
      success: true,
      settings,
      warnings:
        configResult.errors.length > 0 ? configResult.errors : undefined,
    };
  } catch (error: unknown) {
    logError("Error initializing SES region", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { error: errorMessage };
  }
};

// Get SES region settings
export const getSesRegionSettings = async (region: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }

  try {
    const settings = await prisma.sesRegionSettings.findUnique({
      where: { region },
    });

    return { success: true, settings };
  } catch (error: unknown) {
    logError("Error fetching SES region settings", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { error: errorMessage };
  }
};
