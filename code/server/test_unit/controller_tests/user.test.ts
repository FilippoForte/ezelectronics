import {expect, jest, test} from "@jest/globals"
import UserController from "../../src/controllers/userController"
import UserDAO from "../../src/dao/userDAO"
import {Role, User} from "../../src/components/user";
import {UnauthorizedUserError} from "../../src/errors/userError";
import {DateError} from "../../src/utilities";

jest.mock("../../src/dao/userDAO")

const user1 = new User(
    "user1",
    "name1",
    "surname1",
    Role.CUSTOMER,
    "address1",
    "birthdate1"
);

const user2 = new User(
    "user2",
    "name2",
    "surname2",
    Role.MANAGER,
    "address2",
    "birthdate2"
);

const admin = new User(
    "admin1",
    "admin1",
    "admin1",
    Role.ADMIN,
    "admin1",
    "admin1"
);

describe("User controller unit tests", () => {
    describe("UserController_1: createUser method tests", () => {
        let mockCreateUser: any;

        beforeEach(() => {
            mockCreateUser = jest.spyOn(UserDAO.prototype, "createUser");
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        test("UserController_1.1: Insertion of a valid user (it should resolve true)", async () => {
            const controller = new UserController();

            mockCreateUser.mockResolvedValueOnce(true);

            const response = await controller.createUser(user1.username, user1.name, user1.surname, "password", user1.role);

            expect(response).toBe(true);
            expect(mockCreateUser).toHaveBeenCalledTimes(1);
            expect(mockCreateUser).toHaveBeenCalledWith(
                user1.username,
                user1.name,
                user1.surname,
                "password",
                user1.role);
        });
    });

    describe("UserController_2: getUsers", () => {
        let mockGetUsers: any;

        beforeEach(() => {
            mockGetUsers = jest.spyOn(UserDAO.prototype, "getAllUsers");
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test("UserController_2.1: Get all users (it should resolve an Array of User)", async () => {
            const controller = new UserController();

            mockGetUsers.mockResolvedValueOnce([user1, user2]);

            const response = await controller.getUsers();

            expect(response).toEqual([user1, user2]);
            expect(mockGetUsers).toHaveBeenCalledTimes(1);
        });
    });

    describe("UserController_3: getUsersByRole method tests", () => {
        let mockGetUsersByRole: any;

        beforeEach(() => {
            mockGetUsersByRole = jest.spyOn(UserDAO.prototype, "getUsersByRole");
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        test("UserController_3.1: Get users by role (it should resolve an Array of User)", async () => {
            const controller = new UserController();

            mockGetUsersByRole.mockResolvedValueOnce([user1]);

            const response = await controller.getUsersByRole(Role.CUSTOMER);

            expect(response).toEqual([user1]);
            expect(mockGetUsersByRole).toHaveBeenCalledTimes(1);
            expect(mockGetUsersByRole).toHaveBeenCalledWith(Role.CUSTOMER)
        });

        test("UserController_3.2: Illegal role provided (it should reject an Error)", async () => {
            const controller = new UserController();

            try {
                await controller.getUsersByRole("InvalidRole");
            }
            catch (error) {
                expect(error.message).toEqual("Invalid role");
            }

            expect(mockGetUsersByRole).not.toHaveBeenCalled();
        });
    });

    describe("UserController_4: getUserByUsername method tests", () => {
        let mockGetUserByUsername: any;

        beforeEach(() => {
            mockGetUserByUsername = jest.spyOn(UserDAO.prototype, "getUserByUsername");
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        test("UserController_4.1: Get user by username, as a customer (it should resolve a User)", async () => {
            const controller = new UserController();

            mockGetUserByUsername.mockResolvedValueOnce(user1);

            const response = await controller.getUserByUsername(user1, user1.username);

            expect(response).toEqual(user1);
            expect(mockGetUserByUsername).toHaveBeenCalledTimes(1);
            expect(mockGetUserByUsername).toHaveBeenCalledWith(user1.username);
        });

        test("UserController_4.2: Get user by username, as an admin (it should resolve a User)", async () => {
            const controller = new UserController();

            mockGetUserByUsername.mockResolvedValueOnce(user1);

            const response = await controller.getUserByUsername(admin, user1.username);

            expect(response).toEqual(user1);
            expect(mockGetUserByUsername).toHaveBeenCalledTimes(1);
            expect(mockGetUserByUsername).toHaveBeenCalledWith(user1.username);
        });

        test("UserController_4.3: The logged in user is a customer and the provided username is not theirs (it should reject an UnauthorizedUserError)", async () => {
            const controller = new UserController();

            try {
                await controller.getUserByUsername(user1, user2.username);
            }
            catch (error) {
                expect(error).toBeInstanceOf(UnauthorizedUserError);
            }

            expect(mockGetUserByUsername).not.toHaveBeenCalled();
        });
    });

    describe("UserController_5: deleteUser method tests", () => {
        let mockDeleteUser: any;

        beforeEach(() => {
            mockDeleteUser = jest.spyOn(UserDAO.prototype, "deleteUser");
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        test("UserController_5.1: Delete a user (it should resolve true)", async () => {
            const controller = new UserController();

            mockDeleteUser.mockResolvedValueOnce(true);

            const response = await controller.deleteUser(user1, user1.username);

            expect(response).toBe(true);
            expect(mockDeleteUser).toHaveBeenCalledTimes(1);
            expect(mockDeleteUser).toHaveBeenCalledWith(user1, user1.username);
        });
    });

    describe("UserController_6: deleteAll method tests", () => {
        let mockDeleteAll: any;

        beforeEach(() => {
            mockDeleteAll = jest.spyOn(UserDAO.prototype, "deleteAll");
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        test("UserController_6.1: Delete all users from the DB (it should resolve true)", async () => {
            const controller = new UserController();

            mockDeleteAll.mockResolvedValueOnce(true);

            const response = await controller.deleteAll();

            expect(response).toBe(true);
            expect(mockDeleteAll).toHaveBeenCalledTimes(1);
        });
    });

    describe("UserController_7: updateUserInfo method tests", () => {
        let mockUpdateUserInfo: any;

        const newUser = new User(
            "newUser",
            "newUser",
            "newUser",
            Role.CUSTOMER,
            "newUser",
            "newUser"
        );

        beforeEach(() => {
            mockUpdateUserInfo = jest.spyOn(UserDAO.prototype, "updateUserInfo");
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        test("UserController_7.1: Update user info (it should resolve true)", async () => {
            const controller = new UserController();

            mockUpdateUserInfo.mockResolvedValueOnce(newUser);

            const response = await controller.updateUserInfo(admin, newUser.name, newUser.surname, newUser.address, newUser.birthdate, user1.username);

            expect(response).toEqual(newUser);
            expect(mockUpdateUserInfo).toHaveBeenCalledTimes(1);
            expect(mockUpdateUserInfo).toHaveBeenCalledWith(admin, newUser.name, newUser.surname, newUser.address, newUser.birthdate, user1.username);
        });

        test("UserController_7.2: The provided birthdate is after the current date (it should reject a DateError)", async () => {
            const controller = new UserController();

            try {
                await controller.updateUserInfo(admin, newUser.name, newUser.surname, newUser.address, "2345-12-31", user1.username);
            }
            catch (error) {
                expect(error).toBeInstanceOf(DateError);
            }

            expect(mockUpdateUserInfo).not.toHaveBeenCalled();
        });

        test("UserController_7.3: The provided birthdate is not formatted as \"YYYY-MM-DD\" (it should reject a DateError)", async () => {
            const controller = new UserController();

            try {
                await controller.updateUserInfo(admin, newUser.name, newUser.surname, newUser.address, "2023-012-31", user1.username);
            }
            catch (error) {
                expect(error).toBeInstanceOf(DateError);
            }

            expect(mockUpdateUserInfo).not.toHaveBeenCalled();
        });
    });
});