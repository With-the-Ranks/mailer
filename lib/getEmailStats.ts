import prisma from "@/lib/prisma";

export async function getEmailStatsByUser(userId: string) {
  const emails = await prisma.email.findMany({
    where: { userId, published: true },
    select: {
      id: true,
      subject: true,
      audienceList: {
        select: {
          audiences: {
            select: { id: true },
          },
        },
      },
    },
  });

  const emailIds = emails.map((e: { id: string }) => e.id);

  const events = await prisma.emailEvent.findMany({
    where: {
      emailId: { in: emailIds },
    },
  });

  const eventMap: Record<string, { opened: number; clicked: number }> = {};

  for (const event of events) {
    const { emailId, eventType } = event;
    if (!eventMap[emailId]) {
      eventMap[emailId] = { opened: 0, clicked: 0 };
    }

    if (eventType === "opened") {
      eventMap[emailId].opened++;
    } else if (eventType === "clicked") {
      eventMap[emailId].clicked++;
    }
  }

  return emails.map(
    ({
      id,
      subject,
      audienceList,
    }: {
      id: string;
      subject: string | null;
      audienceList: { audiences: { id: string }[] } | null;
    }) => ({
      emailId: id,
      subject,
      sent: audienceList?.audiences.length ?? 0,
      opened: eventMap[id]?.opened ?? 0,
      clicked: eventMap[id]?.clicked ?? 0,
    }),
  );
}

export async function getEmailStatsByOrganization(organizationId: string) {
  const emails = await prisma.email.findMany({
    where: { organizationId, published: true },
    select: {
      id: true,
      subject: true,
      audienceList: {
        select: {
          audiences: {
            select: { id: true },
          },
        },
      },
    },
  });

  const emailIds = emails.map((e: { id: string }) => e.id);

  const events = await prisma.emailEvent.findMany({
    where: {
      emailId: { in: emailIds },
    },
  });

  const eventMap: Record<string, { opened: number; clicked: number }> = {};

  for (const event of events) {
    const { emailId, eventType } = event;
    if (!eventMap[emailId]) {
      eventMap[emailId] = { opened: 0, clicked: 0 };
    }

    if (eventType === "opened") {
      eventMap[emailId].opened++;
    } else if (eventType === "clicked") {
      eventMap[emailId].clicked++;
    }
  }

  return emails.map(
    ({
      id,
      subject,
      audienceList,
    }: {
      id: string;
      subject: string | null;
      audienceList: { audiences: { id: string }[] } | null;
    }) => ({
      emailId: id,
      subject,
      sent: audienceList?.audiences.length ?? 0,
      opened: eventMap[id]?.opened ?? 0,
      clicked: eventMap[id]?.clicked ?? 0,
    }),
  );
}
