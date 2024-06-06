import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  jest,
} from "@jest/globals";
import request from "supertest";
import { app } from "../../index";
import db from "../../src/db/db";
import { Role, User } from "../../src/components/user";
import CartController from "../../src/controllers/cartController";
import Authenticator from "../../src/routers/auth";
import { EmptyProductStockError, ProductNotFoundError } from "../../src/errors/productError";
import { Cart } from "../../src/components/cart";
import { Category, Product } from "../../src/components/product";
import ErrorHandler from "../../src/helper";
import { CartNotFoundError, EmptyCartError, ProductInCartError, ProductNotInCartError } from "../../src/errors/cartError";

const baseURL = "/ezelectronics/carts";

const testUser = new User(
  "testUsername",
  "testName",
  "testSurname",
  Role.CUSTOMER,
  "testAddress",
  "01/01/2020"
);

const inputProduct1 = {
  model: "model1",
  category: Category.LAPTOP,
  quantity: 1,
  price: 15,
};

const inputProduct2 = {
  model: "model2",
  category: Category.APPLIANCE,
  quantity: 2,
  price: 15,
};

// Mock implementations
jest.mock("../../src/routers/auth");
jest.mock("../../src/controllers/cartController");

describe("CartRoutes_1: addToCart method tests", () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

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
    expect(CartController.prototype.addToCart).toHaveBeenCalledTimes(0);
  });

  // Test for user not being a customer
  test("CartRoutes_1.3: It should return 401 if the user is not a customer", async () => {
    // Mock middleware to set user as logged in but not a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = { id: 1, role: Role.ADMIN, username: 'adminUser' }; // Non-customer role
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => res.status(401).end());

    // Make request to the route
    const response = await request(app)
      .post(baseURL)
      .send({ model: 'some-product-model' });

    // Assertions
    expect(response.status).toBe(401);
    expect(CartController.prototype.addToCart).toHaveBeenCalledTimes(0);
  });


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

});

describe("CartRoutes_2: getCart method tests", () => {
  // Run this code after each test to clear and restore all mocks
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // Create a cart object with sample data
  const cart = new Cart(testUser.username, false, "", 35, [inputProduct1, inputProduct2]);

  test("CartRoutes_2.1: It should return a 200 success code and the cart", async () => {
    // Mock the isLoggedIn method of Authenticator to simulate a logged-in user
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testUser;
      return next();
    });

    // Mock the express-validator library to simulate request validation
    jest.mock('express-validator', () => ({
      param: jest.fn().mockImplementation(() => ({
        isString: () => ({ isLength: () => ({}) }),
      })),
    }));

    // Mock the validateRequest method of ErrorHandler to bypass request validation
    jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
      return next();
    });

    // Mock the getCart method of CartController to return the sample cart
    jest.spyOn(CartController.prototype, "getCart").mockResolvedValueOnce(cart);

    // Make a GET request to the base URL and store the response
    const response = await request(app).get(baseURL + "/");

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body equals the sample cart
    expect(response.body).toEqual(cart);

    // Assert that the isLoggedIn method was called once
    expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);

    // Assert that the getCart method was called once
    expect(CartController.prototype.getCart).toHaveBeenCalledTimes(1);

    // Assert that the getCart method was called with the testUser argument
    expect(CartController.prototype.getCart).toHaveBeenCalledWith(testUser);
  });

  test("CartRoutes_2.2: It should return a 200 success code and an empty cart if no unpaid cart or unpaid cart with no products", async () => {
    // Create an empty cart object
    const emptyCart = new Cart(testUser.username, false, "", 0, []);

    // Mock the isLoggedIn method of Authenticator to simulate a logged-in user
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testUser;
      return next();
    });

    // Mock the validateRequest method of ErrorHandler to bypass request validation
    jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
      return next();
    });

    // Mock the getCart method of CartController to return the empty cart
    jest.spyOn(CartController.prototype, "getCart").mockResolvedValueOnce(emptyCart);

    // Make a GET request to the base URL and store the response
    const response = await request(app).get(baseURL + "/");

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body equals the empty cart
    expect(response.body).toEqual(emptyCart);

    // Assert that the isLoggedIn method was called once
    expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);

    // Assert that the getCart method was called once
    expect(CartController.prototype.getCart).toHaveBeenCalledTimes(1);

    // Assert that the getCart method was called with the testUser argument
    expect(CartController.prototype.getCart).toHaveBeenCalledWith(testUser);
  });

});


describe("CartRoutes_3: simulatePayment method tests", () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test("CartRoutes_3.1: It should simulate payment and return 200 success code", async () => {
    const paidCart = new Cart(testUser.username, true, new Date().toISOString().split('T')[0], 45, [inputProduct1, inputProduct2]);

    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    // Mock controller method to resolve successfully
    jest.spyOn(CartController.prototype, "checkoutCart").mockResolvedValueOnce(true);

    // Make request to the route
    const response = await request(app).patch(baseURL);

    // Assertions
    expect(response.status).toBe(200);
    expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(testUser);
  });

  test("CartRoutes_3.2: It should return 404 if there is no information about an unpaid cart in the database", async () => {
    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    // Mock controller method to reject with a 404 error
    const error = new CartNotFoundError();
    jest.spyOn(CartController.prototype, "checkoutCart").mockRejectedValueOnce(error);

    // Make request to the route
    const response = await request(app).patch(baseURL);

    // Assertions
    expect(response.status).toBe(404);
    expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(testUser);
  });

  test("CartRoutes_3.3: It should return 400 if the cart contains no products", async () => {
    const emptyCart = new Cart(testUser.username, false, "", 0, []);

    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    // Mock controller method to reject with a 400 error
    const error = new EmptyCartError();
    jest.spyOn(CartController.prototype, "checkoutCart").mockResolvedValueOnce(false);

    // Make request to the route
    const response = await request(app).patch(baseURL);

    // Assertions
    expect(response.status).toBe(400);
    expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(testUser);
  });


  /*
  test("CartRoutes_3.4: It should return 409 if the product model has zero available quantity", async () => {
    const model = 'OutOfStockProduct';
    const cartWithOutOfStockProduct = new Cart(testUser.username, false, "", 45, [{
      model: "model2",
      category: Category.APPLIANCE,
      quantity: 0,
      price: 15,
    }, inputProduct2]);

    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    // Mock controller method to reject with a 409 error
    const error = new ProductInCartError();
    jest.spyOn(CartController.prototype, "checkoutCart").mockResolvedValueOnce(false);

    // Make request to the route
    const response = await request(app).patch(baseURL);

    // Assertions
    expect(response.status).toBe(409);
    expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(testUser);
  });

  test("CartRoutes_3.5: It should return 409 if the product quantity exceeds the available quantity in the stock", async () => {
    const cartWithExceededProduct = new Cart(testUser.username, false, "", 45, [{
      model: "model2",
      category: Category.APPLIANCE,
      quantity: 999999999,
      price: 15,
    }, inputProduct2]);

    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    // Mock controller method to reject with a 409 error
    const error = new ProductInCartError();
    jest.spyOn(CartController.prototype, "checkoutCart").mockResolvedValueOnce(false);

    // Make request to the route
    const response = await request(app).patch(baseURL);

    // Assertions
    expect(response.status).toBe(409);
    expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(testUser);
  });
*/
});


describe("CartRoutes_3: getCartHistory method tests", () => {
  // Run this code after each test to clear and restore all mocks
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // Sample data for cart history
  const cartHistory = [
    new Cart(testUser.username, true, "2023-01-01", 50, [inputProduct1]),
    new Cart(testUser.username, true, "2023-02-01", 75, [inputProduct2])
  ];

  test("CartRoutes_3.1: It should return a 200 success code and the cart history for a logged-in customer", async () => {
    // Mock the isLoggedIn method of Authenticator to simulate a logged-in user
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testUser;
      return next();
    });

    // Mock the isCustomer method of Authenticator to simulate a customer user
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
      return next();
    });

    // Mock the getCustomerCarts method of CartController to return the sample cart history
    jest.spyOn(CartController.prototype, "getCustomerCarts").mockResolvedValueOnce(cartHistory);

    // Make a GET request to the history URL and store the response
    const response = await request(app).get(baseURL + "/history");

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body equals the sample cart history
    expect(response.body).toEqual(cartHistory);

    // Assert that the isLoggedIn method was called once
    expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);

    // Assert that the isCustomer method was called once
    expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);

    // Assert that the getCustomerCarts method was called once
    expect(CartController.prototype.getCustomerCarts).toHaveBeenCalledTimes(1);

    // Assert that the getCustomerCarts method was called with the testUser argument
    expect(CartController.prototype.getCustomerCarts).toHaveBeenCalledWith(testUser);
  });

  test("CartRoutes_3.2: It should return a 200 success code and an empty array if no cart history exists", async () => {
    // Create an empty cart history
    const emptyCartHistory: Cart[] = [];


    // Mock the isLoggedIn method of Authenticator to simulate a logged-in user
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testUser;
      return next();
    });

    // Mock the isCustomer method of Authenticator to simulate a customer user
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
      return next();
    });

    // Mock the getCustomerCarts method of CartController to return the empty cart history
    jest.spyOn(CartController.prototype, "getCustomerCarts").mockResolvedValueOnce(emptyCartHistory);

    // Make a GET request to the history URL and store the response
    const response = await request(app).get(baseURL + "/history");

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body equals the empty cart history
    expect(response.body).toEqual(emptyCartHistory);

    // Assert that the isLoggedIn method was called once
    expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);

    // Assert that the isCustomer method was called once
    expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);

    // Assert that the getCustomerCarts method was called once
    expect(CartController.prototype.getCustomerCarts).toHaveBeenCalledTimes(1);

    // Assert that the getCustomerCarts method was called with the testUser argument
    expect(CartController.prototype.getCustomerCarts).toHaveBeenCalledWith(testUser);
  });
});


describe("CartRoutes_4: removeProductFromCart method tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test("CartRoutes_4.1: It should return a 200 success code if the product was removed from the cart", async () => {
    const model = "iPhone3";

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
      .spyOn(CartController.prototype, "removeProductFromCart")
      .mockResolvedValueOnce(true);

    // Make request to the route
    const response = await request(app).delete(`${baseURL}/products/${model}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(
      testUser,
      model
    );
  });

  test("CartRoutes_4.2: It should return a 401 if the user is not logged in", async () => {
    const model = "iPhone3";

    // Mock middleware to respond with 401
    jest
      .spyOn(Authenticator.prototype, "isLoggedIn")
      .mockImplementation((req, res, next) => res.status(401).end());

    // Make request to the route
    const response = await request(app).delete(`${baseURL}/products/${model}`);

    // Assertions
    expect(response.status).toBe(401);
    expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledTimes(0);
  });

  test("CartRoutes_4.3: It should return a 401 if the user is not a customer", async () => {
    const model = "iPhone3";

    // Mock middleware to set user as logged in but not a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = { id: 1, role: Role.ADMIN, username: 'adminUser' }; // Non-customer role
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => res.status(401).end());

    // Make request to the route
    const response = await request(app).delete(`${baseURL}/products/${model}`);

    // Assertions
    expect(response.status).toBe(401);
    expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledTimes(0);
  });

  test("CartRoutes_4.4: It should return a 400 if the model is not a non-empty string", async () => {
    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    // Make request to the route with an invalid model
    const response = await request(app).delete(`${baseURL}/products/`);

    // Assertions
    expect(response.status).toBe(422);
    expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledTimes(0);
  });

  test("CartRoutes_4.5: It should return a 404 if the product does not exist in the cart", async () => {
    const model = "nonExistingModel";

    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    // Mock controller method to reject with a 404 error
    const error = new ProductNotInCartError();
    jest.spyOn(CartController.prototype, "removeProductFromCart").mockRejectedValueOnce(error);

    // Make request to the route
    const response = await request(app).delete(`${baseURL}/products/${model}`);

    // Assertions
    expect(response.status).toBe(404);
    expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(testUser, model);
  });

  test("CartRoutes_4.6: It should return a 404 if there is no unpaid cart or if the cart has no products", async () => {
    const model = "iPhone3";

    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    // Mock controller method to reject with a 404 error for unpaid cart or no products in cart
    const error = new CartNotFoundError();
    jest.spyOn(CartController.prototype, "removeProductFromCart").mockRejectedValueOnce(error);

    // Make request to the route
    const response = await request(app).delete(`${baseURL}/products/${model}`);

    // Assertions
    expect(response.status).toBe(404);
    expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(testUser, model);
  });

  test("CartRoutes_4.7: It should return a 404 if model does not represent an existing product", async () => {
    const model = "nonExistingProductModel";

    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = testUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    // Mock controller method to reject with a 404 error for non-existing product
    const error = new ProductNotFoundError();
    jest.spyOn(CartController.prototype, "removeProductFromCart").mockRejectedValueOnce(error);

    // Make request to the route
    const response = await request(app).delete(`${baseURL}/products/${model}`);

    // Assertions
    expect(response.status).toBe(404);
    expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(testUser, model);
  });

});
