import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  jest,
} from "@jest/globals";
import request from "supertest";
import { app } from "../../index";
import db from "../../src/db/db";
import { Role, User } from "../../src/components/user";
import CartController from "../../src/controllers/cartController";
import Authenticator from "../../src/routers/auth";
import { EmptyProductStockError, ProductNotFoundError } from "../../src/errors/productError";

const baseURL = "/ezelectronics/carts";

const testUser = new User(
  "testUsername",
  "testName",
  "testSurname",
  Role.CUSTOMER,
  "testAddress",
  "01/01/2020"
);

// Mock implementations
jest.mock("../../src/routers/auth");
jest.mock("../../src/controllers/cartController");

describe("CartRoutes_1: addToCart method tests", () => {
  const baseURL = "/ezelectronics/carts";
  const testUser = new User(
    "testUsername",
    "testName",
    "testSurname",
    Role.CUSTOMER,
    "testAddress",
    "01/01/2020"
  );

  // Test for successful addition of product to cart
  test("CartRoutes_1.1: It should add a product to the cart and return 200 success code", async () => {
    const model = "iPhone X";

    // Mock middleware to set user as logged in and a customer
    jest
      .spyOn(Authenticator.prototype, "isLoggedIn")
      .mockImplementation((req, res, next) => {
        req.user = testUser;
        next();
      });

    jest
      .spyOn(Authenticator.prototype, "isCustomer")
      .mockImplementation((req, res, next) => next());

    // Mock controller method to resolve successfully
    jest
      .spyOn(CartController.prototype, "addToCart")
      .mockResolvedValueOnce(true);

    // Make request to the route
    const response = await request(app).post(baseURL).send({ model });

    // Assertions
    expect(response.status).toBe(200);
    expect(CartController.prototype.addToCart).toHaveBeenCalledWith(
      testUser,
      model
    );
  });

  // Test for user not logged in
  test("CartRoutes_1.2: It should return 401 if the user is not logged in", async () => {
    // Mock middleware to respond with 401
    jest
      .spyOn(Authenticator.prototype, "isLoggedIn")
      .mockImplementation((req, res, next) => res.status(401).end());

    // Make request to the route
    const response = await request(app)
      .post(baseURL)
      .send({ model: "some-product-model" });

    // Assertions
    expect(response.status).toBe(401);
    expect(CartController.prototype.addToCart).not.toHaveBeenCalled();
  });

  // Test for user not being a customer
  test("CartRoutes_1.3: It should return 401 if the user is not a customer", async () => {
    // Mock middleware to set user as logged in but not a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = { id: 1, role: 'admin', username: 'adminUser' }; // Non-customer role
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => res.status(401).end());

    // Make request to the route
    const response = await request(app)
      .post(baseURL)
      .send({ model: 'some-product-model' });

    // Assertions
    expect(response.status).toBe(401);
    expect(CartController.prototype.addToCart).not.toHaveBeenCalled();
  });


  /*
  test("CartRoutes_1.4: It should return 404 if the product model does not exist", async () => {
    const model = 'NonExistingProduct';

    // Mock middleware per impostare l'utente come loggato e cliente
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    // Mock controller method to reject with a 404 error
    const error = new ProductNotFoundError();
    jest.spyOn(CartController.prototype, "addToCart").mockRejectedValueOnce(error);

    // Make request to the route
    const response = await request(app).post(baseURL).send({ model });

    // Assertions
    expect(response.status).toBe(404);
    expect(CartController.prototype.addToCart).toHaveBeenCalledWith(testUser, model);
  });

  test("CartRoutes_1.5: It should return 409 if the product model has zero available quantity", async () => {
    const model = 'OutOfStockProduct';

    // Mock middleware per impostare l'utente come loggato e cliente
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    // Mock controller method to reject with a 409 error
    const error = new EmptyProductStockError();
    jest.spyOn(CartController.prototype, "addToCart").mockRejectedValueOnce(error);

    // Make request to the route
    const response = await request(app).post(baseURL).send({ model });

    // Assertions
    expect(response.status).toBe(409);
    expect(CartController.prototype.addToCart).toHaveBeenCalledWith(testUser, model);
  });

*/
});
