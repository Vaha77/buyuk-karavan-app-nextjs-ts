/*
  Warnings:

  - You are about to drop the column `basePriceUsd` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `publicMarkup` on the `Product` table. All the data in the column will be lost.
  - Added the required column `country` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullDesc` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `images` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceUsd` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceUzs` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortDesc` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Kategoriya" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Mahsulot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "brend" TEXT,
    "birlik" TEXT NOT NULL DEFAULT 'dona',
    "priceUsd" REAL NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Mahsulot_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Kategoriya" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Komplekt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "modelCode" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KomplektItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "komplektId" TEXT NOT NULL,
    "mahsulotId" TEXT NOT NULL,
    "miqdor" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "KomplektItem_komplektId_fkey" FOREIGN KEY ("komplektId") REFERENCES "Komplekt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KomplektItem_mahsulotId_fkey" FOREIGN KEY ("mahsulotId") REFERENCES "Mahsulot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KalkulyatorSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mijozIsm" TEXT NOT NULL,
    "mijozTel" TEXT NOT NULL,
    "sotuvchiId" TEXT NOT NULL,
    "jami" REAL NOT NULL,
    "yuborildi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KalkulyatorSession_sotuvchiId_fkey" FOREIGN KEY ("sotuvchiId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KalkulyatorItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "mahsulotId" TEXT NOT NULL,
    "miqdor" INTEGER NOT NULL DEFAULT 1,
    "narxUsd" REAL NOT NULL,
    CONSTRAINT "KalkulyatorItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "KalkulyatorSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KalkulyatorItem_mahsulotId_fkey" FOREIGN KEY ("mahsulotId") REFERENCES "Mahsulot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "images" JSONB NOT NULL,
    "priceUsd" REAL NOT NULL,
    "priceUzs" REAL NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "fullDesc" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("category", "createdAt", "id", "isActive", "name", "updatedAt") SELECT "category", "createdAt", "id", "isActive", "name", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Kategoriya_slug_key" ON "Kategoriya"("slug");
