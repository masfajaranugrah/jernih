-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "midtransTransactionId" TEXT,
ADD COLUMN     "snapToken" TEXT;

-- CreateIndex
CREATE INDEX "wishlists_userId_idx" ON "wishlists"("userId");
