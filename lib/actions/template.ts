"use server";

import prisma from "@/lib/prisma";

export interface TemplateParams {
  name: string;
  content: any;
  organizationId: string;
}

export async function createTemplate({
  name,
  content,
  organizationId,
}: TemplateParams) {
  const count = await prisma.template.count({ where: { organizationId } });
  if (count >= 20) throw new Error("Max 20 templates");
  return prisma.template.create({ data: { name, content, organizationId } });
}

export interface UpdateTemplateParams {
  id: string;
  name?: string;
  content: any;
}

export async function updateTemplate({
  id,
  name,
  content,
}: UpdateTemplateParams) {
  return prisma.template.update({ where: { id }, data: { name, content } });
}

export async function getTemplates(orgId: string) {
  return prisma.template.findMany({
    where: { organizationId: orgId },
    orderBy: { updatedAt: "asc" },
  });
}

export async function getTemplateById(id: string) {
  return prisma.template.findUnique({ where: { id } });
}

export async function deleteTemplate(id: string) {
  return prisma.template.delete({ where: { id } });
}
