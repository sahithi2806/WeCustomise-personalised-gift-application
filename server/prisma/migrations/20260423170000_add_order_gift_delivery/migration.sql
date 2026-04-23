ALTER TABLE "orders"
ADD COLUMN "isGift" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "orders"
ADD COLUMN "recipientName" TEXT;

ALTER TABLE "orders"
ADD COLUMN "giftMessage" TEXT;

ALTER TABLE "orders"
ADD COLUMN "scheduledDeliveryAt" DATETIME;
