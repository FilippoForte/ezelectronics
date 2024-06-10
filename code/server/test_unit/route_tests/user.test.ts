import { describe, test, expect, beforeAll, afterAll, afterEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"

import UserController from "../../src/controllers/userController"
import Authenticator from "../../src/routers/auth"
import { Role, User } from "../../src/components/user"
import ErrorHandler from "../../src/helper"
import { body } from "express-validator"
import { UnauthorizedUserError, UserAlreadyExistsError, UserNotFoundError } from "../../src/errors/userError"
import { FutureDateError } from "../../src/errors/productError"
import { DateError } from "../../src/utilities"
const baseURL = "/ezelectronics"

//For unit tests, we need to validate the internal logic of a single component, without the need to test the interaction with other components
//For this purpose, we mock (simulate) the dependencies of the component we are testing
jest.mock("../../src/controllers/userController")
jest.mock("../../src/routers/auth")

let testAdmin = new User("admin", "admin", "admin", Role.ADMIN, "", "")
let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "")



afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
});
describe(" Route_1: POST /users", () => {

    test("Route_1.1: Correct creation of a user.It should return a 200 success code", async () => {
        const inputUser = { username: "test", name: "test", surname: "test", password: "test", role: "Manager" }
        //We mock the express-validator 'body' method to return a mock object with the methods we need to validate the input parameters
        //These methods all return an empty object, because we are not testing the validation logic here (we assume it works correctly)
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
                isIn: () => ({ isLength: () => ({}) }),
            })),
        }))
        //We mock the ErrorHandler validateRequest method to return the next function, because we are not testing the validation logic here (we assume it works correctly)
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next()
        })
        //We mock the UserController createUser method to return true, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(true)

        /*We send a request to the route we are testing. We are in a situation where:
            - The input parameters are 'valid' (= the validation logic is mocked to be correct)
            - The user creation function is 'successful' (= the UserController logic is mocked to be correct)
          We expect the 'createUser' function to have been called with the input parameters and to return a 200 success code
          Since we mock the dependencies and we are testing the route in isolation, we do not need to check that the user has actually been created
        */
        const response = await request(app).post(baseURL + "/users").send(inputUser)
        expect(response.status).toBe(200)
        expect(UserController.prototype.createUser).toHaveBeenCalled()
        expect(UserController.prototype.createUser).toHaveBeenCalledWith(inputUser.username, inputUser.name, inputUser.surname, inputUser.password, inputUser.role)
    })
    test("Route_1.2: Generic error from database", async () => {
        const inputUser = { username: "test", name: "test", surname: "test", password: "test", role: "Manager" }
        //We mock the express-validator 'body' method to return a mock object with the methods we need to validate the input parameters
        //These methods all return an empty object, because we are not testing the validation logic here (we assume it works correctly)
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
                isIn: () => ({ isLength: () => ({}) }),
            })),
        }))
        //We mock the ErrorHandler validateRequest method to return the next function, because we are not testing the validation logic here (we assume it works correctly)
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next()
        })
        //We mock the UserController createUser method to return false, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "createUser").mockRejectedValueOnce(new Error("Generic error"))
        const response = await request(app).post(baseURL + "/users").send(inputUser)
        expect(response.error)
        expect(UserController.prototype.createUser).toHaveBeenCalledWith(inputUser.username, inputUser.name, inputUser.surname, inputUser.password, inputUser.role)


    })
    test("Route_1.3: User already exists", async () => {
        const inputUser = { username: "test", name: "test", surname: "test", password: "test", role: "Manager" }
        //We mock the express-validator 'body' method to return a mock object with the methods we need to validate the input parameters
        //These methods all return an empty object, because we are not testing the validation logic here (we assume it works correctly)
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
                isIn: () => ({ isLength: () => ({}) }),
            })),
        }))
        //We mock the ErrorHandler validateRequest method to return the next function, because we are not testing the validation logic here (we assume it works correctly)
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next()
        })
        //We mock the UserController createUser method to return false, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "createUser").mockRejectedValueOnce(new UserAlreadyExistsError())
        const response = await request(app).post(baseURL + "/users").send(inputUser)
        expect(response.status).toBe(409)
        expect(UserController.prototype.createUser).toHaveBeenCalledWith(inputUser.username, inputUser.name, inputUser.surname, inputUser.password, inputUser.role)

    })
})


//test su input errati nel body
//test username già nel db
describe("Route_2: GET /users", () => {
    test("Route_2.1: Correct retrieval of all users.It returns an array of users", async () => {
        //The route we are testing calls the getUsers method of the UserController and the isAdmin method of the Authenticator
        //We mock the 'getUsers' method to return an array of users, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "getUsers").mockResolvedValueOnce([testAdmin, testCustomer])
        //We mock the 'isLoggedIn' and 'isAdmin' methods to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
            return next();
        })

        //We send a request to the route we are testing. We are in a situation where:
        //  - The user is an Admin (= the Authenticator logic is mocked to be correct)
        //  - The getUsers function returns an array of users (= the UserController logic is mocked to be correct)
        //We expect the 'getUsers' function to have been called, the route to return a 200 success code and the expected array
        const response = await request(app).get(baseURL + "/users")
        expect(response.status).toBe(200)
        expect(UserController.prototype.getUsers).toHaveBeenCalled()
        expect(response.body).toEqual([testAdmin, testCustomer])
    })


    test("Route_2.2: User not an Admin.It should return a 401 error", async () => {
        //In this case, we are testing the situation where the route returns an error code because the user is not an Admin
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We mock the 'isAdmin' method to return a 401 error code, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "User is not an admin" });
        })
        //By calling the route with this mocked dependency, we expect the route to return a 401 error code
        const response = await request(app).get(baseURL + "/users")
        expect(response.status).toBe(401)
    })

    test("Route_2.3: User not logged in.It should return a 401 error", async () => {
        //In this case, we are testing the situation where the route returns an error code because the user is not an Admin
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user" });
        })
        //We mock the 'isAdmin' method to return a 401 error code, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "User is not an admin" });
        })
        //By calling the route with this mocked dependency, we expect the route to return a 401 error code
        const response = await request(app).get(baseURL + "/users")
        expect(response.status).toBe(401)
    })
    test("Route_2.4: Generic error from database", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
            return next();
        })

        const testController = jest.spyOn(UserController.prototype, "getUsers").mockRejectedValueOnce(new Error("Generic error"))
        const response = await request(app).get(baseURL + "/users")
        expect(testController).toHaveBeenCalledTimes(1)
        expect(response.error)


    })
})

describe("Route_3:GET /users/roles/:role", () => {

    test("Route3.1: Correct retrieval of all users of a specific role.It returns an array of users with a specific role", async () => {
        //The route we are testing calls the getUsersByRole method of the UserController, the isAdmin method of the Authenticator, and the param method of the express-validator
        //We mock the 'getUsersByRole' method to return an array of users, because we are not testing the UserController logic here (we assume it works correctly)
        jest.spyOn(UserController.prototype, "getUsersByRole").mockResolvedValueOnce([testAdmin])
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We mock the 'isAdmin' method to return the next function, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
            return next();
        })

        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
                isIn: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        //We call the route with the mocked dependencies. We expect the 'getUsersByRole' function to have been called, the route to return a 200 success code and the expected array
        const response = await request(app).get(baseURL + "/users/roles/Admin")
        expect(response.status).toBe(200)
        expect(UserController.prototype.getUsersByRole).toHaveBeenCalled()
        expect(UserController.prototype.getUsersByRole).toHaveBeenCalledWith("Admin")
        expect(response.body).toEqual([testAdmin])
    })

    test("Route_3.2: Role is not valid.It should fail if the role is not valid", async () => {
        //In this case we are testing a scenario where the role parameter is not among the three allowed ones
        //We need the 'isAdmin' method to return the next function, because the route checks if the user is an Admin before validating the role
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
            return next();
        });
        //We mock the 'param' method of the express-validator to throw an error, because we are not testing the validation logic here (we assume it works correctly)
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => {
                throw new Error("Invalid value");
            }),
        }));
        //We mock the 'validateRequest' method to receive an error and return a 422 error code, because we are not testing the validation logic here (we assume it works correctly)
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        });
        //We call the route with dependencies mocked to simulate an error scenario, and expect a 422 code
        const response = await request(app).get(baseURL + "/users/roles/Invalid")
        expect(response.status).toBe(422)
    });
    test("Route_3.3: User not an Admin.It should return a 401 error", async () => {
        //In this case, we are testing the situation where the route returns an error code because the user is not an Admin
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        //We mock the 'isAdmin' method to return a 401 error code, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "User is not an admin" });
        })
        //By calling the route with this mocked dependency, we expect the route to return a 401 error code
        const response = await request(app).get(baseURL + "/users")
        expect(response.status).toBe(401)
    })

    test("Route_3.4: User not logged in.It should return a 401 error", async () => {
        //In this case, we are testing the situation where the route returns an error code because the user is not an Admin
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user" });
        })
        //We mock the 'isAdmin' method to return a 401 error code, because we are not testing the Authenticator logic here (we assume it works correctly)
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "User is not an admin" });
        })
        //By calling the route with this mocked dependency, we expect the route to return a 401 error code
        const response = await request(app).get(baseURL + "/users")
        expect(response.status).toBe(401)
    })
    test("Route_3.5: Generic Error", async () => {
        //In this case, we are testing the situation where the route returns an error code because the user is not an Admin
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
            return next();
        })
        jest.spyOn(UserController.prototype, "getUsersByRole").mockRejectedValueOnce(new Error())


        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isIn: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).get(baseURL + "/users/roles/Customer")
        expect(response.error)
        expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(1)
    })
})

describe("Route_4: GET /users/:username", () => {

    test("Route_4.1: Correct retrieval of a user.It should return a 200 success code ", async () => {

        jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValue(testCustomer);
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).get(baseURL + "/users/" + testCustomer.username)


        expect(response.status).toBe(200)
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalled()
        expect(response.body).toEqual(testCustomer)

    })
    test("Route_4.2: User not logged in.It should return a 401 error", async () => {

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user" });
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).get(baseURL + "/users/" + testCustomer.username)
        expect(response.status).toBe(401)
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(0)

    });
    test("Route_4.4: username not exists in the database.It should return a 404 error", async () => {
        const username = "notAUser"
        jest.spyOn(UserController.prototype, "getUserByUsername").mockRejectedValue(new UserNotFoundError());
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).get(baseURL + "/users/" + username)


        expect(response.status).toBe(404)
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalled()

    });
    test("Route_4.5: Customer tries to update another user. It should return a 401 error", async () => {

        jest.spyOn(UserController.prototype, "getUserByUsername").mockRejectedValue(new UnauthorizedUserError());
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).get(baseURL + "/users/" + testAdmin.username)
        expect(response.status).toBe(401)
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalled()
    });
    test("Route_4.6: Generic error", async () => {

        jest.spyOn(UserController.prototype, "getUserByUsername").mockRejectedValue(new Error());
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).get(baseURL + "/users/" + testAdmin.username)
        expect(response.error)
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1)
    })
})


describe("Route_5: DELETE /users/:username", () => {
    test("Route_5.1: Correct deletion of a user.It should return a 200 success code ", async () => {
        let testAdmin = {
            username: "admin",
            name: "admin",
            surname: "admin",
            role: Role.ADMIN,
            address: "",
            birthdate: ""
        };
        let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "");
        jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValue(true);
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).delete(baseURL + "/users/" + testCustomer.username)
        expect(response.status).toBe(200)
        expect(UserController.prototype.deleteUser).toHaveBeenCalled()

    });
    test("Route_5.2: User not logged in.It should return a 401 error", async () => {

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user" });
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).get(baseURL + "/users/" + testCustomer.username)
        expect(response.status).toBe(401)
        expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(0)
    });
    test("Route_5.3: username not exists in the database.It should return a 404 error", async () => {
        const testUser = new User("username", "name", "surname", Role.CUSTOMER, "", "")
        jest.spyOn(UserController.prototype, "deleteUser").mockRejectedValue(new UserNotFoundError());
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user == testAdmin.username;
            return next();
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).delete(baseURL + "/users/" + testUser.username)
        expect(response.status).toBe(404)
        expect(UserController.prototype.deleteUser).toHaveBeenCalled()

    });
    test("Route_5.4: Customer tries to delete another user. It should return a 401 error", async () => {

        jest.spyOn(UserController.prototype, "deleteUser").mockRejectedValue(new UnauthorizedUserError());
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).delete(baseURL + "/users/" + testAdmin.username)
        expect(response.status).toBe(401)
        expect(UserController.prototype.deleteUser).toHaveBeenCalled()
    });
    test("Route_5.5: Admin tries to delete another admin It should return a 401 error", async () => {
        jest.spyOn(UserController.prototype, "deleteUser").mockRejectedValueOnce(new UnauthorizedUserError());
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).delete(baseURL + "/users/" + testAdmin.username)
        expect(response.status).toBe(401)
        expect(UserController.prototype.deleteUser).toHaveBeenCalled()
    })
    test("Route_5.6: Generic error", async ()=>{

        jest.spyOn(UserController.prototype, "deleteUser").mockRejectedValue(new Error());
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).delete(baseURL + "/users/" + testAdmin.username)
        expect(response.error)
        expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(1)
    })

})

describe("Route_6: DELETE/users/", () => {
    test("Route_6.1: Correct deletion of all users.It should return a 200 success code ", async () => {
        jest.spyOn(UserController.prototype, "deleteAll").mockResolvedValue(true);
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).delete(baseURL + "/users")
        expect(response.status).toBe(200)
        expect(UserController.prototype.deleteAll).toHaveBeenCalled()
    })
    test("Route_6.2: User not logged in.It should return a 401 error", async () => {

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user" });
        })
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "User is not an admin" });
        })
        const response = await request(app).delete(baseURL + "/users")
        expect(response.status).toBe(401)
        expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(0)
    })
    test("Route_6.3: User not admin.It should return a 401 error", async () => {

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => res.status(401).end());

        const response = await request(app).delete(baseURL + "/users")
        expect(response.status).toBe(401)
        expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(0)
    })
    test("Route_6.4: Generic error", async ()=>{

        jest.spyOn(UserController.prototype, "deleteAll").mockRejectedValue(new Error());
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => next());

        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).delete(baseURL + "/users/")
        expect(response.error)
        expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(1)
    })
})
describe("Route_7: PATCH /users/:username", () => {

    test("Route_7.1: Correct update of a user.It should return a 200 success code ", async () => {
        let testAdmin = {
            username: "admin",
            name: "admin",
            surname: "admin",
            role: Role.ADMIN,
            address: "",
            birthdate: ""
        };
        const bodyRequest = {
            name: "oldName",
            surname: "oldSurname",
            address: "oldAddress",
            birthdate: "oldBirthdate"
        }
        let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "");
        jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValue(testCustomer);
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
                isIn: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next()
        })
        const response = await (await request(app).patch(baseURL + "/users/" + testCustomer.username).send(bodyRequest))
        expect(response.status).toBe(200)
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalled()
        expect(response.body).toEqual(testCustomer)
    })
    test("Route_7.2: username not exists in the database.It should return a 404 error", async () => {
        let testAdmin = {
            username: "admin",
            name: "admin",
            surname: "admin",
            role: Role.ADMIN,
            address: "",
            birthdate: ""
        };
        const bodyRequest = {
            name: "oldName",
            surname: "oldSurname",
            address: "oldAddress",
            birthdate: "oldBirthdate"
        }
        jest.spyOn(UserController.prototype, "updateUserInfo").mockRejectedValue(new UserNotFoundError());
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user == testAdmin.username;
            return next();
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).patch(baseURL + "/users/NotAUser").send(bodyRequest)
        expect(response.status).toBe(404)
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalled()

    });
    test("Route_7.3: Customer tries to delete another user. It should return a 401 error", async () => {
        const testUser = {
            username: "user",
            name: "user",
            surname: "user",
            role: Role.CUSTOMER,
            address: "",
            birthdate: ""
        }
        const bodyRequest = {
            name: "oldName",
            surname: "oldSurname",
            address: "oldAddress",
            birthdate: "oldBirthdate"
        }
        jest.spyOn(UserController.prototype, "updateUserInfo").mockRejectedValue(new UnauthorizedUserError());
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).patch(baseURL + "/users/" + testUser.username).send(bodyRequest)
        expect(response.status).toBe(401)
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalled()

    })

    test("Route_7.4: Birthdate is after current date. It should return a 400 error", async () => {
        const bodyRequest = {
            name: "oldName",
            surname: "oldSurname",
            address: "oldAddress",
            birthdate: "2022-01-01"
        }
        jest.spyOn(UserController.prototype, "updateUserInfo").mockRejectedValue(new DateError());
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        })
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }))
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        const response = await request(app).patch(baseURL + "/users/" + testCustomer.username).send(bodyRequest)
        expect(response.status).toBe(400)
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalled()
    })
    test("Route_7.5: Parameters not valid. It should return a 422 error", async () => {
        const bodyRequest = {
            name: "",
            surname: "oldSurname",
            address: "oldAddress",
            birthdate: "oldBirthdate"
        }
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => {
                throw new Error("Invalid value");
            }),
        }));
        //We mock the 'validateRequest' method to receive an error and return a 422 error code, because we are not testing the validation logic here (we assume it works correctly)
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        });
        const response = await request(app).patch(baseURL + "/users/" + testCustomer.username).send(bodyRequest)
        expect(response.status).toBe(422)
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(0)
    })
    
})

