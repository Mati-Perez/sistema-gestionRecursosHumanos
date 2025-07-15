/*
  Warnings:

  - You are about to drop the column `fecha` on the `Factura` table. All the data in the column will be lost.
  - Added the required column `fechaCarga` to the `Factura` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaPago` to the `Factura` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Factura" DROP COLUMN "fecha",
ADD COLUMN     "fechaCarga" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fechaPago" TIMESTAMP(3) NOT NULL;
