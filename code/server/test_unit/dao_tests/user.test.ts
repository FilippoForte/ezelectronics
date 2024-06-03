import { test, expect, jest } from "@jest/globals"

import UserDAO from "../../src/dao/userDAO"
import crypto from "crypto"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import {UnauthorizedUserError, UserAlreadyExistsError, UserNotFoundError} from "../../src/errors/userError";
import {Role, User} from "../../src/components/user";

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

describe("UserDAO_1: getIsUserAuthenticated method tests", () => {
    let mockDBGet: any;
    let mockRandomBytes: any;
    let mockScrypt: any;

    beforeEach(async () => {
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
        jest.restoreAllMocks();
    });

    test("UserDAO_1.1: The user is authenticated (it should resolve true)", async () => {
        const userDAO = new UserDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbRow);
        });

        const result = await userDAO.getIsUserAuthenticated(testUser.username, testUser.password);

        expect(result).toBe(true);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockRandomBytes).toHaveBeenCalledTimes(0);
        expect(mockScrypt).toHaveBeenCalledTimes(1);
    });

    test("UserDAO_1.2: The user does not exist (it should resolve false)", async () => {
        const userDAO = new UserDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, null);
        });

        const result = await userDAO.getIsUserAuthenticated(testUser.username, testUser.password);

        expect(result).toBe(false);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockRandomBytes).toHaveBeenCalledTimes(0);
    });

    test("UserDAO_1.3: The hashed password doesn't match (it should resolve false)", async () => {
        const userDAO = new UserDAO();
        let row = {...dbRow};
        row.salt = Buffer.from("tlas");

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, row);
        });

        const result = await userDAO.getIsUserAuthenticated(testUser.username, testUser.password);

        expect(result).toBe(false);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockRandomBytes).toHaveBeenCalledTimes(0);
        expect(mockScrypt).toHaveBeenCalledTimes(1);
    });
});

describe("UserDAO_2: createUser method tests", () => {
    let mockRandomBytes: any;
    let mockScrypt: any;
    let mockDBRun: any;

    beforeEach(async () => {
        mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementation(() => {
            return (Buffer.from("salt"));
        })

        mockScrypt = jest.spyOn(crypto, "scryptSync").mockImplementation(() => {
            return Buffer.from("hashedPassword");
        })

        mockDBRun = jest.spyOn(db, "run");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    })

    test("UserDAO_2.1: Insertion of a valid user (it should resolve true)", async () => {
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

    test("UserDAO_2.2: Insertion of an already existing user (it should reject with UserAlreadyExistsError)", async () => {
        const userDAO = new UserDAO();

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: any) => {
            callback(null);
        }).mockImplementationOnce((_sql: any, _params: any, callback: any) => {
            callback(new Error("UNIQUE constraint failed: users.username"));
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

describe("UserDAO_3: getUserByUsername method tests", () => {
    let mockDBGet: any;

    beforeEach(async () => {
        mockDBGet = jest.spyOn(db, "get");
    });

    afterEach( () => {
        jest.restoreAllMocks();
    });

    test("UserDAO_3.1: Get a valid user (it should resolve a User)", async () => {
        const userDAO = new UserDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
           callback(null, dbRow);
        });

        const result = await userDAO.getUserByUsername(testUser.username);

        expect(result).toBeInstanceOf(User);
        expect(result.username).toEqual(dbRow.username);
        expect(result.name).toEqual(dbRow.name);
        expect(result.surname).toEqual(dbRow.surname);
        expect(result.role).toEqual(dbRow.role);
        expect(result.address).toEqual(dbRow.address);
        expect(result.birthdate).toEqual(dbRow.birthdate);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
    });

    test("UserDAO_3.2: Try to get a non existent user (it should reject with UserNotFoundError)", async () => {
        const userDAO = new UserDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, null);
        });

        await expect(userDAO.getUserByUsername(testUser.username))
            .rejects
            .toThrow(UserNotFoundError);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
    });
});

describe("UserDAO_4: getAllUsers method tests", () => {
    let mockDBAll: any;
    let rowList: unknown[];
    let row1: any;
    let row2: any;

    beforeEach(async () => {
        mockDBAll = jest.spyOn(db, "all");

        row1 = {...dbRow};
        row2 = {...dbRow};
        row1.username = "row1";
        row2.username = "row2";

        rowList = [row1, row2];
    });

    afterEach( () => {
        jest.restoreAllMocks();
    });

    test("UserDAO_4.1: Get all users (it should resolve an array of User)", async () => {
        const userDAO = new UserDAO();

        mockDBAll.mockImplementationOnce((_sql: any, callback: (err: Error | null, rows: unknown[]) => void) => {
            callback(null, rowList);
        });

        const result = await userDAO.getAllUsers();

        expect(mockDBAll).toHaveBeenCalledTimes(1);
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(User);
        expect(result[1]).toBeInstanceOf(User);
    });

    test("UserDAO_4.2: SQLite throws an error (it should reject the error)", async () => {
        const userDAO = new UserDAO();

        mockDBAll.mockImplementationOnce((_sql: any, callback: (err: Error | null, rows: any) => void) => {
            callback(new Error(), null);
        });

        await expect(userDAO.getAllUsers()).rejects.toThrow(Error);
        expect(mockDBAll).toHaveBeenCalledTimes(1);
    });
});

describe("UserDAO_5: deleteAll method tests", () => {
    let mockDBRun: any;

    beforeEach(async () => {
        mockDBRun = jest.spyOn(db, "run");
    });

    afterEach( () => {
        jest.restoreAllMocks();
    });

    test("UserDAO_5.1: Deletes all Users except for Admins (it should resolve true)", async () => {
        const userDAO = new UserDAO();

        mockDBRun.mockImplementationOnce((_sql: any, callback: (err: Error | null) => void) => {
            callback(null);
            return {} as Database;
        });

        const result = await userDAO.deleteAll();

        expect(result).toBe(true);
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });

    test("UserDAO_5.2: SQLite throws an Error (it should reject the error)", async () => {
        const userDAO = new UserDAO();

        mockDBRun.mockImplementationOnce((_sql: any, callback: (err: Error | null) => void) => {
            callback(new Error());
        });

        await expect(userDAO.deleteAll()).rejects.toThrow(Error);
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });
});

describe("UserDAO_6: getUsersByRole method tests", () => {
    let mockDBAll: any;
    let rowList: unknown[];
    let row1, row2: any;

    beforeEach(async () => {
        mockDBAll = jest.spyOn(db, "all");

        row1 = {...dbRow}; row2 = {...dbRow};
        row1.username = "row1"; row2.username = "row2";

        rowList = [row1, row2];
    });

    afterEach( () => {
        jest.restoreAllMocks();
    });

    test("UserDAO_6.1: Get Users by role (it should resolve an array of User)", async () => {
        const userDAO = new UserDAO();

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, rows: unknown[]) => void) => {
            callback(null, rowList);
        });

        const result = await userDAO.getUsersByRole("Manager");

        expect(mockDBAll).toHaveBeenCalledTimes(1);
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(User);
        expect(result[1]).toBeInstanceOf(User);
        expect(result[0].role).toEqual(result[1].role);
    });

    test("UserDAO_6.2: SQLite throws an Error (it should reject the error)", async () => {
        const userDAO = new UserDAO();

        mockDBAll.mockImplementationOnce((_sql: any, callback: (err: Error | null, rows: any) => void) => {
            callback(new Error(), null);
        });

        await expect(userDAO.getAllUsers()).rejects.toThrow(Error);
        expect(mockDBAll).toHaveBeenCalledTimes(1);
    });
});

describe("UserDAO_7: updateUserInfo method tests", () => {
    let mockDBGet: any, mockDBRun: any;

    beforeEach(async () => {
        mockDBGet = jest.spyOn(db, "get");
        mockDBRun = jest.spyOn(db, "run");
    });

    afterEach( () => {
        jest.restoreAllMocks();
    });

    test("UserDAO_7.1: A User changes their information (it should resolve the updated User)", async () => {
        const userDAO = new UserDAO();
        const loggedIn = new User(dbRow.username, dbRow.name, dbRow.surname, Role.MANAGER, dbRow.address, dbRow.birthdate);
        const newUser = new User(loggedIn.username, "newName", "newSurname", loggedIn.role, "newAddress", "newBirthdate");

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, dbRow);
        });

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null) => void) => {
            callback(null);
        });

        const result = await userDAO.updateUserInfo(loggedIn, newUser.name, newUser.surname, newUser.address, newUser.birthdate, loggedIn.username);

        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [loggedIn.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledTimes(1);
        expect(result).toBeInstanceOf(User);
        expect(result.username).toEqual(loggedIn.username);
        expect(result.name).toEqual(newUser.name);
        expect(result.surname).toEqual(newUser.surname);
        expect(result.address).toEqual(newUser.address);
        expect(result.birthdate).toEqual(newUser.birthdate);
    });

    test("UserDAO_7.2: Admin changes a non-Admin User's information (it should resolve the updated User)", async () => {
        const userDAO = new UserDAO();
        const admin = new User("admin", "admin", "admin", Role.ADMIN, "adminAddr", "adminBirth");
        const targetUser = new User(dbRow.username, dbRow.name, dbRow.surname, Role.MANAGER, dbRow.address, dbRow.birthdate);
        const newUser = new User(dbRow.username, "newName", "newSurname", targetUser.role, "newAddress", "newBirthdate");

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, dbRow);
        });

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null) => void) => {
            callback(null);
        });

        const result = await userDAO.updateUserInfo(admin, newUser.name, newUser.surname, newUser.address, newUser.birthdate,  targetUser.username);

        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [targetUser.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledTimes(1);
        expect(result).toBeInstanceOf(User);
        expect(result.username).toEqual(targetUser.username);
        expect(result.name).toEqual(newUser.name);
        expect(result.surname).toEqual(newUser.surname);
        expect(result.address).toEqual(newUser.address);
        expect(result.birthdate).toEqual(newUser.birthdate);
    });

    test("UserDAO_7.3: a non-Admin User tries to change another User's information (it should reject an UnauthorizedUserError)", async () => {
        const userDAO = new UserDAO();
        const loggedIn = new User("loggedIn", "loggedIn", "loggedIn", Role.MANAGER, "loggedInAddr", "loggedInBirth");
        const targetUser = new User(dbRow.username, dbRow.name, dbRow.surname, Role.CUSTOMER, dbRow.address, dbRow.birthdate);
        const newUser = new User(dbRow.username, "newName", "newSurname", targetUser.role, "newAddress", "newBirthdate");
        let row = {...dbRow};
        row.role = "Customer";

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, row);
        });

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null) => void) => {
            callback(null);
        });

        await expect(userDAO.updateUserInfo(loggedIn, newUser.name, newUser.surname, newUser.address, newUser.birthdate, targetUser.username))
            .rejects
            .toThrow(UnauthorizedUserError);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [targetUser.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });

    test("UserDAO_7.4: Admin tries to change another Admin's information (it should reject an UnauthorizedUserError)", async () => {
        const userDAO = new UserDAO();
        const admin = new User("admin", "admin", "admin", Role.ADMIN, "adminAddr", "adminBirth");
        const targetAdmin = new User(dbRow.username, dbRow.name, dbRow.surname, Role.ADMIN, dbRow.address, dbRow.birthdate);
        const newAdmin = new User(dbRow.username, "newName", "newSurname", targetAdmin.role, "newAddress", "newBirthdate");
        let row = {...dbRow};
        row.role = "Admin";

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, row);
        });

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null) => void) => {
            callback(null);
        });


        await expect(userDAO.updateUserInfo(admin, newAdmin.name, newAdmin.surname, newAdmin.address, newAdmin.birthdate, targetAdmin.username))
            .rejects
            .toThrow(UnauthorizedUserError);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [targetAdmin.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });

    test("UserDAO_7.5: Admin tries to change a non-existent User information (it should reject a UserNotFoundError)", async () => {
        const userDAO = new UserDAO();
        const admin = new User("admin", "admin", "admin", Role.ADMIN, "adminAddr", "adminBirth");
        const targetUser = new User(dbRow.username, dbRow.name, dbRow.surname, Role.CUSTOMER, dbRow.address, dbRow.birthdate);
        const newUser = new User(dbRow.username, "newName", "newSurname", targetUser.role, "newAddress", "newBirthdate");

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, null);
        });

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null) => void) => {
            callback(null);
        });

        await expect(userDAO.updateUserInfo(admin, newUser.name, newUser.surname, newUser.address, newUser.birthdate, targetUser.username))
            .rejects
            .toThrow(UserNotFoundError);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [targetUser.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });

    test("UserDAO_7.6: SQLite get method throws an Error (it should reject the error)", async () => {
        const userDAO = new UserDAO();
        const loggedIn = new User(dbRow.username, dbRow.name, dbRow.surname, Role.MANAGER, dbRow.address, dbRow.birthdate);
        const newUser = new User(loggedIn.username, "newName", "newSurname", loggedIn.role, "newAddress", "newBirthdate");

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(new Error(), null);
        });
        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null) => void) => {
            callback(null);
        });

        try {
            await userDAO.updateUserInfo(loggedIn, newUser.name, newUser.surname, newUser.address, newUser.birthdate, loggedIn.name);
        }
        catch(error) {
            expect(error).not.toBeInstanceOf(UnauthorizedUserError);
            expect(error).not.toBeInstanceOf(UserNotFoundError);
            expect(error).toBeInstanceOf(Error);
        }

        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [loggedIn.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });

    test("UserDAO_7.7: SQLite run method throws an Error (it should reject the error)", async () => {
        const userDAO = new UserDAO();
        const targetUser = new User(dbRow.username, dbRow.name, dbRow.surname, Role.MANAGER, dbRow.address, dbRow.birthdate);
        const newUser = new User(targetUser.username, "newName", "newSurname", targetUser.role, "newAddress", "newBirthdate");

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, dbRow);
        });
        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null) => void) => {
            callback(new Error());
        });

        try {
            await userDAO.updateUserInfo(targetUser, newUser.name, newUser.surname, newUser.address, newUser.birthdate, targetUser.name);
        }
        catch(error) {
            expect(error).not.toBeInstanceOf(UnauthorizedUserError);
            expect(error).not.toBeInstanceOf(UserNotFoundError);
            expect(error).toBeInstanceOf(Error);
        }

        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [targetUser.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });
});

describe("UserDAO_8: deleteUser method tests", () => {
    let mockDBGet: any;
    let mockDBRun: any;

    beforeEach(async () => {
        mockDBGet = jest.spyOn(db, "get");
        mockDBRun = jest.spyOn(db, "run");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    })

    test("UserDAO_8.1: A (non-Admin) User deletes themselves (it should resolve true)", async () => {
        const userDAO = new UserDAO();
        const user = new User(dbRow.username, dbRow.name, dbRow.surname, Role.MANAGER, dbRow.address, dbRow.birthdate);

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, dbRow);
        });

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null) => void) => {
            callback(null);
        });

        const result = await userDAO.deleteUser(user, user.username);

        expect(result).toBe(true);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });

    test("UserDAO_8.2: Admin deletes a User (it should resolve true)", async () => {
        const userDAO = new UserDAO();
        const admin = new User("admin", "admin", "admin", Role.ADMIN, "adminAddr", "adminBirth");
        const targetUser = new User(dbRow.username, dbRow.name, dbRow.surname, Role.MANAGER, dbRow.address, dbRow.birthdate);

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, dbRow);
        });

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null) => void) => {
            callback(null);
        });

        const result = await userDAO.deleteUser(admin, targetUser.username);

        expect(result).toBe(true);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [targetUser.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });

    test("UserDAO_8.3: Admin deletes themselves (it should resolve true)", async () => {
        const userDAO = new UserDAO();
        const admin = new User("admin", "admin", "admin", Role.ADMIN, "adminAddr", "adminBirth");
        let row = {username: "admin", name: "admin", surname: "admin", role: "Admin", address: "adminAddr", birthdate: "adminBirth"};

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, row);
        });

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null) => void) => {
            callback(null);
        });

        const result = await userDAO.deleteUser(admin, admin.username);

        expect(result).toBe(true);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [admin.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });

    test("UserDAO_8.4: a non-admin User tries to delete another User (it should reject an UnauthorizedUserError)", async () => {
        const userDAO = new UserDAO();
        const user = new User(dbRow.username, dbRow.name, dbRow.surname, Role.MANAGER, dbRow.address, dbRow.birthdate);
        let row = {...dbRow};
        dbRow.username = "anotherUser";

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, row);
        });

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null) => void) => {
            callback(null);
        });

        await expect(userDAO.deleteUser(user, "anotherUser")).rejects.toThrow(UnauthorizedUserError);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });

    test("UserDAO_8.5: Admin tries to delete another Admin (it should reject an UnauthorizedUserError)", async () => {
        const userDAO = new UserDAO();
        const admin = new User("admin", "admin", "admin", Role.ADMIN, "adminAddr", "adminBirth");
        const targetAdmin = new User(dbRow.username, dbRow.name, dbRow.surname, Role.ADMIN, dbRow.address, dbRow.birthdate);
        let row = {...dbRow};
        row.role = "Admin";

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, row);
        });

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null) => void) => {
            callback(null);
        });

        await expect(userDAO.deleteUser(admin, targetAdmin.username)).rejects.toThrow(UnauthorizedUserError);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [targetAdmin.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });

    test("UserDAO_8.6: Admin tries to delete a non-existent user (it should reject a UserNotFoundError)", async () => {
        const userDAO = new UserDAO();
        const admin = new User("admin", "admin", "admin", Role.ADMIN, "adminAddr", "adminBirth");

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, null);
        });

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null) => void) => {
            callback(null);
        });

        await expect(await userDAO.deleteUser(admin, "username")).rejects.toThrow(UserNotFoundError);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), ["username"], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });

    test("UserDAO_8.7: SQLite get method throws an Error (it should reject the error)", async () => {
        const userDAO = new UserDAO();
        const user = new User(dbRow.username, dbRow.name, dbRow.surname, Role.MANAGER, dbRow.address, dbRow.birthdate);

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(new Error(), null);
        });
        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null) => void) => {
            callback(null);
        });

        try {
            await userDAO.deleteUser(user, user.username);
        }
        catch(error) {
            expect(error).not.toBeInstanceOf(UnauthorizedUserError);
            expect(error).not.toBeInstanceOf(UserNotFoundError);
            expect(error).toBeInstanceOf(Error);
        }

        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });

    test("UserDAO_8.8: SQLite run method throws an Error (it should reject the error)", async () => {
        const userDAO = new UserDAO();
        const user = new User(dbRow.username, dbRow.name, dbRow.surname, Role.MANAGER, dbRow.address, dbRow.birthdate);

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, dbRow);
        });
        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null) => void) => {
            callback(new Error());
        });

        try {
            await userDAO.deleteUser(user, user.username);
        }
        catch(error) {
            expect(error).not.toBeInstanceOf(UnauthorizedUserError);
            expect(error).not.toBeInstanceOf(UserNotFoundError);
            expect(error).toBeInstanceOf(Error);
        }

        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });
});