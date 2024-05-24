DROP TABLE IF EXISTS "users";
DROP TABLE IF EXISTS "products";
DROP TABLE IF EXISTS "carts";
DROP TABLE IF EXISTS "ProductInCart";
DROP TABLE IF EXISTS "reviews";

CREATE TABLE "users" (
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "address" TEXT,
    "birthdate" TEXT,
    PRIMARY KEY("username")
);

CREATE TABLE "products" (
    "category" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "sellingPrice" DOUBLE NOT NULL,
    "arrivalDate" TEXT,
    "details" TEXT,
    "quantity" INTEGER NOT NULL,
    PRIMARY KEY("model")
);

CREATE TABLE "carts" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "customer" TEXT NOT NULL,
    "paid" BOOLEAN NOT NULL,
    "paymentDate" TEXT,
    FOREIGN KEY ("customer") REFERENCES "users"("username")
);

CREATE TABLE "productInCart" (
    "modelProduct" TEXT NOT NULL,
    "idCart" INTEGER NOT NULL,
    "quantityInCart" INTEGER NOT NULL,
    PRIMARY KEY("modelProduct", "idCart"),
    FOREIGN KEY ("idCart") REFERENCES "carts"("id"),
    FOREIGN KEY ("modelProduct") REFERENCES "products"("model")
);

CREATE TABLE "reviews" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "model" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    FOREIGN KEY ("model") REFERENCES "products"("model"),
    FOREIGN KEY ("user") REFERENCES "users"("username")
);
