import { test, expect, jest } from "@jest/globals"

import UserDAO from "../../src/dao/userDAO"
import crypto from "crypto"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import {UserAlreadyExistsError, UserNotFoundError} from "../../src/errors/userError";

/*
TODO: Nelle routes: test che lo username passato alla get corrisponda allo username dello user che chiama la route
 e che quest'ultimo abbia ruolo Admin.
*/

const testUser = {
    username: "test",
    name: "test",
    surname: "test",
    password: "test",
    role: "Manager"
};

const dbRow = {
    username: "test",
    name: "test",
    surname: "test",
    password: Buffer.from("hashedPassword"),
    role: "Manager",
    address: "test",
    birthdate: "test",
    salt: Buffer.from("salt")
};

describe("UserDAO: getIsUserAuthenticated method tests", () => {
    let mockDBGet: any;
    let mockRandomBytes: any;
    let mockScrypt: any;

    beforeAll(async () => {
        mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementation(() => {
            return (Buffer.from("salt"));
        })

        mockScrypt = jest.spyOn(crypto, "scryptSync").mockImplementation((_password , salt, _keylen) => {
            if (salt as String != "salt") return Buffer.from("brokenPassword");
            return Buffer.from("hashedPassword");
        })

        mockDBGet = jest.spyOn(db, "get");
    });

    afterEach( () => {
        jest.clearAllMocks();
    });

    test("The user is authenticated (it should resolve true)", async () => {
        const userDAO = new UserDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbRow);
        });

        const result = await userDAO.getIsUserAuthenticated(testUser.username, testUser.password);

        expect(result).toBe(true);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockRandomBytes).toHaveBeenCalledTimes(0);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
    });

    test("The user does not exist (it should resolve false)", async () => {
        const userDAO = new UserDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, null);
        });

        const result = await userDAO.getIsUserAuthenticated(testUser.username, testUser.password);

        expect(result).toBe(false);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockRandomBytes).toHaveBeenCalledTimes(0);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
    });

    test("The hashed password doesn't match (it should resolve false)", async () => {
        const userDAO = new UserDAO();
        let row = dbRow;
        row.salt = Buffer.from("tlas");

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, row);
        });

        const result = await userDAO.getIsUserAuthenticated(testUser.username, testUser.password);

        expect(result).toBe(false);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockRandomBytes).toHaveBeenCalledTimes(0);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
    });
});

describe("UserDAO: createUser method tests", () => {
    let mockRandomBytes: any;
    let mockScrypt: any;
    let mockDBRun: any;

    beforeAll(async () => {
        mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementation(() => {
            return (Buffer.from("salt"));
        })

        mockScrypt = jest.spyOn(crypto, "scryptSync").mockImplementation(() => {
            return Buffer.from("hashedPassword");
        })

        mockDBRun = jest.spyOn(db, "run");
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    test("Insertion of a valid user (it should resolve true)", async () => {
        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: any) => {
            callback(null);
            return {} as Database;
        });

        const userDAO = new UserDAO();
        const result = await userDAO.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);

        expect(result).toBe(true);
        expect(mockRandomBytes).toHaveBeenCalledTimes(1);
        expect(mockScrypt).toHaveBeenCalledTimes(1);
        expect(mockDBRun).toHaveBeenCalledTimes(1);
        expect(mockDBRun).toHaveBeenCalledWith(
            expect.any(String),
            [testUser.username, testUser.name, testUser.surname, testUser.role, Buffer.from("hashedPassword"), Buffer.from("salt")],
            expect.any(Function)
        );
    });

    test("Insertion of an already existing user (it should reject with UserAlreadyExistsError)", async () => {
        const err = new UserAlreadyExistsError();
        const userDAO = new UserDAO();

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: any) => {
            callback(null);
            return {} as Database;
        }).mockImplementationOnce((_sql: any, _params: any, callback: any) => {
            callback(err);
            return {} as Database;
        });

        await userDAO.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);

        await expect(userDAO.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role))
            .rejects
            .toThrow(UserAlreadyExistsError);
          //or .rejects.toBeInstanceOf(UserAlreadyExistsError);

        expect(mockRandomBytes).toHaveBeenCalledTimes(2);
        expect(mockScrypt).toHaveBeenCalledTimes(2);
        expect(mockDBRun).toHaveBeenCalledTimes(2);
        expect(mockDBRun).toHaveBeenCalledWith(
            expect.any(String),
            [testUser.username, testUser.name, testUser.surname, testUser.role, Buffer.from("hashedPassword"), Buffer.from("salt")],
            expect.any(Function)
        );
    });
});

describe("UserDAO: getUserByUsername method tests", () => {
    let mockDBGet: any;

    beforeAll(async () => {
        mockDBGet = jest.spyOn(db, "get");
    });

    afterEach( () => {
        jest.clearAllMocks();
    });

    test("Get a valid user (it should resolve a User)", async () => {
        const userDAO = new UserDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
           callback(null, dbRow);
        });

        const result = await userDAO.getUserByUsername(testUser.username);

        expect(result.username).toEqual(dbRow.username);
        expect(result.name).toEqual(dbRow.name);
        expect(result.surname).toEqual(dbRow.surname);
        expect(result.role).toEqual(dbRow.role);
        expect(result.address).toEqual(dbRow.address);
        expect(result.birthdate).toEqual(dbRow.birthdate);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
    });

    test("Try to get a non existent user (it should reject with UserNotFoundError)", async () => {
        const userDAO = new UserDAO();
        const err404 = new UserNotFoundError();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(err404, null);
        });

        await expect(userDAO.getUserByUsername(testUser.username))
            .rejects
            .toThrow(UserNotFoundError);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
    });
});
