import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const roles = [
  { id: 1, name: "User" },
  { id: 2, name: "Admin" },
];

for (const { id, name } of roles) {
  try {
    const roleExists = await prisma.role.count({ where: { id, name } });

    if (roleExists) {
      console.log("Role already exists:", { id, name });
      continue;
    }

    const createdRole = await prisma.role.create({ data: { id, name } });
    console.log("Role created:", createdRole);
  } catch {
    console.log("Role import failed:", { id, name });
  }
}
