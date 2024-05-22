import { test, expect, jest } from "@jest/globals"

import UserController from "../../src/controllers/userController"
import UserDAO from "../../src/dao/userDAO"
import crypto from "crypto"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import * as fs from "node:fs";
import {UserAlreadyExistsError} from "../../src/errors/userError";

jest.mock("crypto")

const dbInitPath = "./src/db/queryCreazioneDB.sql"
function runSqlScript(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            db.exec(data, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
}

async function setupDatabase() {
    try {
        await runSqlScript(dbInitPath);
    } catch (err) {
        console.error('Error setting up the database:', err);
    }
}

//Example of unit test for the createUser method
//It mocks the database run method to simulate a successful insertion and the crypto randomBytes and scrypt methods to simulate the hashing of the password
//It then calls the createUser method and expects it to resolve true
describe("UserDAO: createUser method tests", () => {
    let mockRandomBytes: any;
    let mockScrypt: any;

    beforeAll(async () => {
        jest.setTimeout(20000);

        await setupDatabase();

        mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementation((size) => {
            return (Buffer.from("salt"))
        })
        mockScrypt = jest.spyOn(crypto, "scryptSync").mockImplementation((password, salt, keylen) => {
            return Buffer.from("hashedPassword")
        })
    });

    afterEach(() => {
        jest.clearAllMocks(); // Restore the calls counter for all mocks
        jest.restoreAllMocks();
        db.serialize(() => {
            db.run("DELETE FROM users") // Delete every record from the table "users"
        });
    })

    test("Insertion of a valid user (it should resolve true)", async () => {
        const userDAO = new UserDAO()

        const result = await userDAO.createUser("username", "name", "surname", "password", "Manager");

        expect(result).toBe(true);
        expect(mockRandomBytes).toHaveBeenCalledTimes(1);
        expect(mockScrypt).toHaveBeenCalledTimes(1);

        const user = await userDAO.getUserByUsername("username");

        expect(user.username).toBe("username");
        expect(user.name).toBe("name");
        expect(user.surname).toBe("surname");
        expect(user.role).toBe("Manager");
        expect(user.address).toBe(null);
        expect(user.birthdate).toBe(null);
    });

    test("Insertion of an already existing user (it should reject with UserAlreadyExistsError)", async () => {
        const userDAO = new UserDAO()

        await userDAO.createUser("username", "name", "surname", "password", "Manager");

        await expect(userDAO.createUser("username", "name", "surname", "password", "Manager"))
            .rejects
            .toThrow(UserAlreadyExistsError);
        expect(mockRandomBytes).toHaveBeenCalledTimes(2);
        expect(mockScrypt).toHaveBeenCalledTimes(2);
    });
});
