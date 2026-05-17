/*
  Warnings:

  - You are about to drop the column `country` on the `Product` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tur" TEXT NOT NULL DEFAULT 'oddiy',
    "birlik" TEXT NOT NULL DEFAULT 'dona',
    "image" TEXT NOT NULL,
    "images" JSONB NOT NULL,
    "priceUsd" REAL NOT NULL,
    "priceUzs" REAL NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "fullDesc" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("category", "createdAt", "fullDesc", "id", "image", "images", "isActive", "name", "priceUsd", "priceUzs", "rating", "shortDesc", "updatedAt") SELECT "category", "createdAt", "fullDesc", "id", "image", "images", "isActive", "name", "priceUsd", "priceUzs", "rating", "shortDesc", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
