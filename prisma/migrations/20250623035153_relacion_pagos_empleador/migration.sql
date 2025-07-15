/*
  Warnings:

  - Added the required column `apellido` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profesion` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellido` to the `Empleado` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PAGADO', 'RETRASADO');

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "apellido" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "profesion" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Empleado" ADD COLUMN     "apellido" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Pago" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "empleadoId" INTEGER NOT NULL,
    "empleadorId" INTEGER,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_empleadorId_fkey" FOREIGN KEY ("empleadorId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
