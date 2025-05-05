import fs from "fs";
import path from "path";

import prisma from "./prisma";

export async function seedOrgTemplates(orgId: string) {
  const dir = path.join(process.cwd(), "lib", "email-templates", "json");
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const content = JSON.parse(raw);

    const filename = path.basename(file, ".json");
    const name = filename
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const existing = await prisma.template.findFirst({
      where: { organizationId: orgId, name },
    });

    if (existing) {
      await prisma.template.update({
        where: { id: existing.id },
        data: { content },
      });
    } else {
      await prisma.template.create({
        data: { organizationId: orgId, name, content },
      });
    }
  }
}
