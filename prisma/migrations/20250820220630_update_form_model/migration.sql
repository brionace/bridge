/*
  Warnings:

  - You are about to drop the `PaymentMethods` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `fields` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `settings` on the `Form` table. All the data in the column will be lost.
  - Added the required column `pages` to the `Form` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PaymentMethods";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Form" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pages" JSONB NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Form" ("createdAt", "id", "isDraft", "name", "updatedAt", "userId") SELECT "createdAt", "id", "isDraft", "name", "updatedAt", "userId" FROM "Form";
DROP TABLE "Form";
ALTER TABLE "new_Form" RENAME TO "Form";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
