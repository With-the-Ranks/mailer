/* 
    This was the migration script we used to migrate from
    our old database to the new Vercel Postgres database.
    It's not needed anymore, but I'm keeping it here for
    posterity.
*/

import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

export async function GET() {
  //   Download data from old database
  //  const users = await prisma.user.findMany();
  //  const accounts = await prisma.account.findMany();
  //  const organizations = await prisma.organization.findMany();
  //  const emails = await prisma.email.findMany();
  //  const examples = await prisma.example.findMany();

  //  fs.writeFileSync("users.json", JSON.stringify(users));
  //  fs.writeFileSync("accounts.json", JSON.stringify(accounts));
  //   fs.writeFileSync("organizations.json", JSON.stringify(organizations));
  //   fs.writeFileSync("emails.json", JSON.stringify(emails));
  //   fs.writeFileSync("examples.json", JSON.stringify(examples));

  // Upload data to new database
  //   const users = JSON.parse(fs.readFileSync("users.json", "utf8"));
  //   const accounts = JSON.parse(fs.readFileSync("accounts.json", "utf8"));
  //   const organizations = JSON.parse(fs.readFileSync("organizations.json", "utf8"));
  //   const emails = JSON.parse(fs.readFileSync("emails.json", "utf8"));
  //   const examples = JSON.parse(fs.readFileSync("examples.json", "utf8"));

  //   const response = await Promise.all([
  //     prisma.user.createMany({
  //       data: users,
  //       skipDuplicates: true,
  //     }),
  //     prisma.account.createMany({
  //       data: accounts,
  //       skipDuplicates: true,
  //     }),
  //     prisma.organization.createMany({
  //       data: organizations,
  //       skipDuplicates: true,
  //     }),
  //     prisma.email.createMany({
  //       data: emails,
  //       skipDuplicates: true,
  //     }),
  //   prisma.example.createMany({
  //     data: examples,
  //     skipDuplicates: true,
  //   })

  return NextResponse.json({ response: "ok" });
}
