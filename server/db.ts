import { PrismaClient } from "@prisma/client";

const connection = new PrismaClient();

connection.$executeRawUnsafe(`
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA auto_vacuum = FULL;
`);

export default connection;
