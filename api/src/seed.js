import { db } from "./db.js";
import bcrypt from "bcryptjs";

export async function seedAdminIfEnabled() {
  if (process.env.SEED_ADMIN !== "true") return;

  const TABLE = process.env.USERS_TABLE || "users";
  const EMAIL = process.env.EMAIL_COL || "email";
  const PASS = process.env.PASS_COL || "password_hash";
  const ROLE = process.env.ROLE_COL || "role";

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASS = process.env.ADMIN_PASSWORD;
  const hash = bcrypt.hashSync(ADMIN_PASS, 10);

  const exists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(TABLE);
  if (!exists) {
    let ddl = `CREATE TABLE ${TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ${EMAIL} TEXT UNIQUE NOT NULL,
      ${PASS} TEXT NOT NULL`;
    if (ROLE) ddl += `, ${ROLE} TEXT DEFAULT 'admin'`;
    ddl += `);`;
    db.exec(ddl);
    console.log(`Tabela ${TABLE} criada.`);
  }

  const user = db.prepare(`SELECT * FROM ${TABLE} WHERE ${EMAIL}=?`).get(ADMIN_EMAIL);
  if (user) {
    db.prepare(
      `UPDATE ${TABLE} SET ${PASS}=? ${ROLE ? `, ${ROLE}='admin'` : ""} WHERE ${EMAIL}=?`
    ).run(hash, ADMIN_EMAIL);
    console.log("👑 Admin atualizado com nova senha.");
  } else {
    db.prepare(
      `INSERT INTO ${TABLE} (${EMAIL}, ${PASS}${ROLE ? `, ${ROLE}` : ""})
       VALUES (?, ?${ROLE ? ", 'admin'" : ""})`
    ).run(ADMIN_EMAIL, hash);
    console.log("✅ Admin criado com sucesso.");
  }
}