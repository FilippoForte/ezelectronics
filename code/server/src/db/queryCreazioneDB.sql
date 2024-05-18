-- SQLite

DROP TABLE "products";
DROP TABLE "carts";
DROP TABLE "ProductInCart";
DROP TABLE "reviews";

CREATE TABLE "products" (
    "sellingPrice" NUMBER NOT NULL,
    "model" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "arrivalDate" TEXT,
    "details" TEXT,
    "quantity" NUMBER NOT NULL,
    PRIMARY KEY("model")
);

CREATE TABLE "carts" (
    "id" NUMBER AUTO INCREMENT,
    "customer" NUMBER NOT NULL,
    "paid" BOOLEAN NOT NULL,
    "paymentDate" TEXT,
    PRIMARY KEY("id"),
    FOREIGN KEY ("customer") REFERENCES "users"("username")
);

CREATE TABLE "ProductInCart" (
    "modelProduct" TEXT NOT NULL,
    "idCart" NUMBER NOT NULL,
    "quantityInCart" NUMBER NOT NULL,
    PRIMARY KEY("modelProduct", "idCart"),
    FOREIGN KEY ("idCart") REFERENCES "carts"("id"),
    FOREIGN KEY ("modelProduct") REFERENCES "products"("model")
);

CREATE TABLE "reviews" (
    "id" NUMBER AUTO INCREMENT,
    "model" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "score" NUMBER NOT NULL,
    "date" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    PRIMARY KEY("id"),
    FOREIGN KEY ("model") REFERENCES "products"("model"),
    FOREIGN KEY ("user") REFERENCES "users"("user")
);
