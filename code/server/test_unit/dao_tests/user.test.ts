import { test, expect, jest } from "@jest/globals"

import UserDAO from "../../src/dao/userDAO"
import crypto from "crypto"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import {UserAlreadyExistsError} from "../../src/errors/userError";

//Example of unit test for the createUser method
//It mocks the database run method to simulate a successful insertion and the crypto randomBytes and scrypt methods to simulate the hashing of the password
//It then calls the createUser method and expects it to resolve true
describe("UserDAO: createUser method tests", () => {
    let mockRandomBytes: any;
    let mockScrypt: any;
    let mockDBRun: any;
    let testUser: any;

    beforeAll(async () => {
        mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementation(() => {
            return (Buffer.from("salt"));
        })

        mockScrypt = jest.spyOn(crypto, "scryptSync").mockImplementation(() => {
            return Buffer.from("hashedPassword");
        })

        mockDBRun = jest.spyOn(db, "run");

        testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        }
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    test("Insertion of a valid user (it should resolve true)", async () => {
        mockDBRun.mockImplementationOnce((sql: any, params: any, callback: any) => {
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
        let err = new UserAlreadyExistsError();
        const userDAO = new UserDAO();

        mockDBRun.mockImplementationOnce((sql: any, params: any, callback: any) => {
            callback(null);
            return {} as Database;
        }).mockImplementationOnce((sql: any, params: any, callback: any) => {
            callback(err);
            return {} as Database;
        });

        await userDAO.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);

        await expect(userDAO.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role))
            .rejects
            .toThrow(UserAlreadyExistsError);

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
