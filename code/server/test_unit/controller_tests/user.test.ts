import { test, expect, jest } from "@jest/globals"
import UserController from "../../src/controllers/userController"
import UserDAO from "../../src/dao/userDAO"
import {UserAlreadyExistsError} from "../../src/errors/userError";

jest.mock("../../src/dao/userDAO")

//Example of a unit test for the createUser method of the UserController
//The test checks if the method returns true when the DAO method returns true
//The test also expects the DAO method to be called once with the correct parameters

describe("UserController: createUser method tests", () => {
    let createUserSpy: any;

    beforeEach(() => {
        createUserSpy = jest.spyOn(UserDAO.prototype, "createUser");
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test("Insertion of a valid user (it should resolve true)", async () => {
        const testUser = { //Define a test user object
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        }
        createUserSpy.mockResolvedValueOnce(true); //Mock the createUser method of the DAO
        const controller = new UserController(); //Create a new instance of the controller
        //Call the createUser method of the controller with the test user object
        const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);

        //Check if the createUser method of the DAO has been called once with the correct parameters
        expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
            testUser.name,
            testUser.surname,
            testUser.password,
            testUser.role);
        expect(response).toBe(true); //Check if the response is true
    });

    test("Insertion of an already existing user (it should reject with UserAlreadyExistsError)", async () => {
        const testUser = { //Define a test user object
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        }
        createUserSpy.mockRejectedValueOnce(new UserAlreadyExistsError()); //Mock the createUser method of the DAO
        const controller = new UserController(); //Create a new instance of the controller

        await expect(controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role))
            .rejects
            .toThrow(UserAlreadyExistsError);

        //Check if the createUser method of the DAO has been called once with the correct parameters
        expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
            testUser.name,
            testUser.surname,
            testUser.password,
            testUser.role);

    })
});