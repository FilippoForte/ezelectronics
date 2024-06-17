"use strict"

import db from "../db/db";

/**
 * Deletes all data from the database.
 * This function must be called before any integration test, to ensure a clean database state for each test run.
 */

export function cleanup() {
    db.serialize(() => {
        // Delete all data from the database.
        db.run("DELETE FROM users")
        db.run("DELETE FROM products")
        db.run("DELETE FROM productInCart")
        db.run("DELETE FROM carts")
        db.run("DELETE FROM reviews")
    })
}

export async function cleanupAsync(): Promise<void> {
    const tables = ["users", "products", "productInCart", "carts", "reviews"];
    return new Promise((resolve, reject) => {
        let remaining = tables.length;

        tables.forEach((table) => {
            db.run(`DELETE FROM ${table}`, (err: Error | null) => {
                if (err) {
                    return reject(err);
                }
                remaining -= 1;
                if (remaining === 0) {
                    resolve();
                }
            });
        });
    });
}