import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const roles = [
  { id: 1, name: "User" },
  { id: 2, name: "Admin" },
];

for (const { id, name } of roles) {
  try {
    const roleExists = await db.role.count({ where: { id, name } });

    if (roleExists) {
      console.log("Role already exists:", { id, name });
      continue;
    }

    const createdRole = await db.role.create({ data: { id, name } });
    console.log("Role created:", createdRole);
  } catch (err) {
    console.log("Role import failed:", { id, name }, err);
  }
}
