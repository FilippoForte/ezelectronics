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

const adminUser = new User(
  "adminUsername",
  "adminName",
  "adminSurname",
  Role.ADMIN,
  "adminAddress",
  "01/01/2020"
);

const managerUser = new User(
  "managerUsername",
  "managerName",
  "managerSurname",
  Role.MANAGER,
  "managerAddress",
  "01/01/2020"
);

const customerUser = new User(
  "customerUsername",
  "customerName",
  "customerSurname",
  Role.CUSTOMER,
  "customerAddress",
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
        req.user = customerUser;
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
      customerUser,
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
      req.user = customerUser;
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
    expect(CartController.prototype.addToCart).toHaveBeenCalledWith(customerUser, model);
  });

  test("CartRoutes_1.5: It should return 409 if the product model has zero available quantity", async () => {
    const model = 'OutOfStockProduct';

    // Mock middleware per impostare l'utente come loggato e cliente
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
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
    expect(CartController.prototype.addToCart).toHaveBeenCalledWith(customerUser, model);
  });

});

describe("CartRoutes_2: getCart method tests", () => {
  // Run this code after each test to clear and restore all mocks
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // Create a cart object with sample data
  const cart = new Cart(customerUser.username, false, "", 35, [inputProduct1, inputProduct2]);

  test("CartRoutes_2.1: It should return a 200 success code and the cart", async () => {
    // Mock the isLoggedIn method of Authenticator to simulate a logged-in user
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
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

    // Assert that the getCart method was called with the customerUser argument
    expect(CartController.prototype.getCart).toHaveBeenCalledWith(customerUser);
  });

  test("CartRoutes_2.2: It should return a 200 success code and an empty cart if no unpaid cart or unpaid cart with no products", async () => {
    // Create an empty cart object
    const emptyCart = new Cart(customerUser.username, false, "", 0, []);

    // Mock the isLoggedIn method of Authenticator to simulate a logged-in user
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
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

    // Assert that the getCart method was called with the customerUser argument
    expect(CartController.prototype.getCart).toHaveBeenCalledWith(customerUser);
  });

});


describe("CartRoutes_3: checkoutCart method tests", () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test("CartRoutes_3.1: It should simulate payment and return 200 success code", async () => {
    const paidCart = new Cart(customerUser.username, true, new Date().toISOString().split('T')[0], 45, [inputProduct1, inputProduct2]);

    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    // Mock controller method to resolve successfully
    jest.spyOn(CartController.prototype, "checkoutCart").mockResolvedValueOnce(true);

    // Make request to the route
    const response = await request(app).patch(baseURL);

    // Assertions
    expect(response.status).toBe(200);
    expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(customerUser);
  });

  test("CartRoutes_3.2: It should return 404 if there is no information about an unpaid cart in the database", async () => {
    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
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
    expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(customerUser);
  });

  test("CartRoutes_3.3: It should return 400 if the cart contains no products", async () => {
    const emptyCart = new Cart(customerUser.username, false, "", 0, []);

    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    // Mock controller method to reject with a 400 error
    const error = new EmptyCartError();
    jest.spyOn(CartController.prototype, "checkoutCart").mockRejectedValueOnce(error);

    // Make request to the route
    const response = await request(app).patch(baseURL);

    // Assertions
    expect(response.status).toBe(400);
    expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(customerUser);
  });


  /*
  test("CartRoutes_3.4: It should return 409 if the product model has zero available quantity", async () => {
    const model = 'OutOfStockProduct';
    const cartWithOutOfStockProduct = new Cart(customerUser.username, false, "", 45, [{
      model: "model2",
      category: Category.APPLIANCE,
      quantity: 0,
      price: 15,
    }, inputProduct2]);

    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
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
    expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(customerUser);
  });

  test("CartRoutes_3.5: It should return 409 if the product quantity exceeds the available quantity in the stock", async () => {
    const cartWithExceededProduct = new Cart(customerUser.username, false, "", 45, [{
      model: "model2",
      category: Category.APPLIANCE,
      quantity: 999999999,
      price: 15,
    }, inputProduct2]);

    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
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
    expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(customerUser);
  });
*/
});


describe("CartRoutes_4: getCartHistory method tests", () => {
  // Run this code after each test to clear and restore all mocks
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // Sample data for cart history
  const cartHistory = [
    new Cart(customerUser.username, true, "2023-01-01", 50, [inputProduct1]),
    new Cart(customerUser.username, true, "2023-02-01", 75, [inputProduct2])
  ];

  test("CartRoutes_4.1: It should return a 200 success code and the cart history for a logged-in customer", async () => {
    // Mock the isLoggedIn method of Authenticator to simulate a logged-in user
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
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

    // Assert that the getCustomerCarts method was called with the customerUser argument
    expect(CartController.prototype.getCustomerCarts).toHaveBeenCalledWith(customerUser);
  });

  test("CartRoutes_4.2: It should return a 200 success code and an empty array if no cart history exists", async () => {
    // Create an empty cart history
    const emptyCartHistory: Cart[] = [];


    // Mock the isLoggedIn method of Authenticator to simulate a logged-in user
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
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

    // Assert that the getCustomerCarts method was called with the customerUser argument
    expect(CartController.prototype.getCustomerCarts).toHaveBeenCalledWith(customerUser);
  });
});


describe("CartRoutes_5: removeProductFromCart method tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test("CartRoutes_5.1: It should return a 200 success code if the product was removed from the cart", async () => {
    const model = "iPhone3";

    // Mock middleware to set user as logged in and a customer
    jest
      .spyOn(Authenticator.prototype, "isLoggedIn")
      .mockImplementation((req, res, next) => {
        req.user = customerUser;
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
      customerUser,
      model
    );
  });

  test("CartRoutes_5.2: It should return a 401 if the user is not logged in", async () => {
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

  test("CartRoutes_5.3: It should return a 401 if the user is not a customer", async () => {
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

  test("CartRoutes_5.4: It should return a 404 if the model is a empty string", async () => {
    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    // Make request to the route with an invalid model
    const response = await request(app).delete(`${baseURL}/products/`);

    // Assertions
    expect(response.status).toBe(404);
    expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledTimes(0);
  });

  test("CartRoutes_5.5: It should return a 404 if the product does not exist in the cart", async () => {
    const model = "nonExistingModel";

    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
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
    expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(customerUser, model);
  });

  test("CartRoutes_5.6: It should return a 404 if there is no unpaid cart or if the cart has no products", async () => {
    const model = "iPhone3";

    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
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
    expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(customerUser, model);
  });

  test("CartRoutes_5.7: It should return a 404 if model does not represent an existing product", async () => {
    const model = "nonExistingProductModel";

    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
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
    expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(customerUser, model);
  });

});


describe("CartRoutes_6: clearCart method tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test("CartRoutes_6.1: It should return a 200 success code if the products were removed from the cart", async () => {
    // Mock middleware to set user as logged in and a customer
    jest
      .spyOn(Authenticator.prototype, "isLoggedIn")
      .mockImplementation((req, res, next) => {
        req.user = customerUser;
        next();
      });

    jest
      .spyOn(Authenticator.prototype, "isCustomer")
      .mockImplementation((req, res, next) => next());

    // Mock controller method to resolve successfully
    jest
      .spyOn(CartController.prototype, "clearCart")
      .mockResolvedValueOnce(true);

    // Make request to the route
    const response = await request(app).delete(`${baseURL}/current`);

    // Assertions
    expect(response.status).toBe(200);
    expect(CartController.prototype.clearCart).toHaveBeenCalledWith(customerUser);
  });

  test("CartRoutes_6.2: It should return a 401 if the user is not logged in", async () => {
    // Mock middleware to respond with 401
    jest
      .spyOn(Authenticator.prototype, "isLoggedIn")
      .mockImplementation((req, res, next) => res.status(401).end());

    // Make request to the route
    const response = await request(app).delete(`${baseURL}/current`);

    // Assertions
    expect(response.status).toBe(401);
    expect(CartController.prototype.clearCart).toHaveBeenCalledTimes(0);
  });

  test("CartRoutes_6.3: It should return a 401 if the user is not a customer", async () => {
    // Mock middleware to set user as logged in but not a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = { id: 1, role: Role.ADMIN, username: 'adminUser' }; // Non-customer role
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => res.status(401).end());

    // Make request to the route
    const response = await request(app).delete(`${baseURL}/current`);

    // Assertions
    expect(response.status).toBe(401);
    expect(CartController.prototype.clearCart).toHaveBeenCalledTimes(0);
  });

  test("CartRoutes_6.4: It should return a 404 if there is no unpaid cart for the user", async () => {
    // Mock middleware to set user as logged in and a customer
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    // Mock controller method to reject with a 404 error
    const error = new CartNotFoundError();
    jest.spyOn(CartController.prototype, "clearCart").mockRejectedValueOnce(error);

    // Make request to the route
    const response = await request(app).delete(`${baseURL}/current`);

    // Assertions
    expect(response.status).toBe(404);
    expect(CartController.prototype.clearCart).toHaveBeenCalledWith(customerUser);
  });
});


describe("CartRoutes_7: deleteAllCarts method tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test("CartRoutes_7.1: It should return a 200 success code if all carts were deleted by an admin", async () => {
    // Mock middleware to set user as logged in and an admin
    jest
      .spyOn(Authenticator.prototype, "isLoggedIn")
      .mockImplementation((req, res, next) => {
        req.user = adminUser;
        next();
      });

    jest
      .spyOn(Authenticator.prototype, "isAdminOrManager")
      .mockImplementation((req, res, next) => next());

    // Mock controller method to resolve successfully
    jest
      .spyOn(CartController.prototype, "deleteAllCarts")
      .mockResolvedValueOnce(true);

    // Make request to the route
    const response = await request(app).delete(`${baseURL}/`);

    // Assertions
    expect(response.status).toBe(200);
    expect(CartController.prototype.deleteAllCarts).toHaveBeenCalledTimes(1);
  });

  test("CartRoutes_7.2: It should return a 200 success code if all carts were deleted by a manager", async () => {
    // Mock middleware to set user as logged in and a manager
    jest
      .spyOn(Authenticator.prototype, "isLoggedIn")
      .mockImplementation((req, res, next) => {
        req.user = managerUser;
        next();
      });

    jest
      .spyOn(Authenticator.prototype, "isAdminOrManager")
      .mockImplementation((req, res, next) => next());

    // Mock controller method to resolve successfully
    jest
      .spyOn(CartController.prototype, "deleteAllCarts")
      .mockResolvedValueOnce(true);

    // Make request to the route
    const response = await request(app).delete(`${baseURL}/`);

    // Assertions
    expect(response.status).toBe(200);
    expect(CartController.prototype.deleteAllCarts).toHaveBeenCalledTimes(1);
  });

  test("CartRoutes_7.3: It should return a 401 if the user is not logged in", async () => {
    // Mock middleware to respond with 401
    jest
      .spyOn(Authenticator.prototype, "isLoggedIn")
      .mockImplementation((req, res, next) => res.status(401).end());

    // Make request to the route
    const response = await request(app).delete(`${baseURL}/`);

    // Assertions
    expect(response.status).toBe(401);
    expect(CartController.prototype.deleteAllCarts).toHaveBeenCalledTimes(0);
  });

  test("CartRoutes_7.4: It should return a 403 if the user is not an admin or manager", async () => {
    // Mock middleware to set user as logged in but not an admin or manager
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => res.status(403).end());

    // Make request to the route
    const response = await request(app).delete(`${baseURL}/`);

    // Assertions
    expect(response.status).toBe(403);
    expect(CartController.prototype.deleteAllCarts).toHaveBeenCalledTimes(0);
  });
});


describe("CartRoutes_8: getAllCarts method tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // Sample data for all carts
  const allCarts = [
    new Cart(customerUser.username, true, "2023-01-01", 50, [inputProduct1]),
    new Cart(customerUser.username, false, "", 75, [inputProduct2])
  ];

  test("CartRoutes_8.1: It should return a 200 success code and all carts for a logged-in admin", async () => {
    // Mock the isLoggedIn method of Authenticator to simulate a logged-in admin user
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = adminUser;
      return next();
    });

    // Mock the isAdminOrManager method of Authenticator to simulate an admin user
    jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
      return next();
    });

    // Mock the getAllCarts method of CartController to return the sample all carts
    jest.spyOn(CartController.prototype, "getAllCarts").mockResolvedValueOnce(allCarts);

    // Make a GET request to the all URL and store the response
    const response = await request(app).get(baseURL + "/all");

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body equals the sample all carts
    expect(response.body).toEqual(allCarts);

    // Assert that the isLoggedIn method was called once
    expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);

    // Assert that the isAdminOrManager method was called once
    expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);

    // Assert that the getAllCarts method was called once
    expect(CartController.prototype.getAllCarts).toHaveBeenCalledTimes(1);
  });

  test("CartRoutes_8.2: It should return a 200 success code and an empty array if no carts exist", async () => {
    // Create an empty carts array
    const emptyCarts: Cart[] = [];

    // Mock the isLoggedIn method of Authenticator to simulate a logged-in admin user
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = adminUser;
      return next();
    });

    // Mock the isAdminOrManager method of Authenticator to simulate an admin user
    jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
      return next();
    });

    // Mock the getAllCarts method of CartController to return the empty carts array
    jest.spyOn(CartController.prototype, "getAllCarts").mockResolvedValueOnce(emptyCarts);

    // Make a GET request to the all URL and store the response
    const response = await request(app).get(baseURL + "/all");

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body equals the empty carts array
    expect(response.body).toEqual(emptyCarts);

    // Assert that the isLoggedIn method was called once
    expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);

    // Assert that the isAdminOrManager method was called once
    expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);

    // Assert that the getAllCarts method was called once
    expect(CartController.prototype.getAllCarts).toHaveBeenCalledTimes(1);
  });

  test("CartRoutes_8.3: It should return a 401 if the user is not logged in", async () => {
    // Mock middleware to respond with 401
    jest
      .spyOn(Authenticator.prototype, "isLoggedIn")
      .mockImplementation((req, res, next) => res.status(401).end());

    // Make request to the route
    const response = await request(app).get(`${baseURL}/all`);

    // Assertions
    expect(response.status).toBe(401);
    expect(CartController.prototype.getAllCarts).toHaveBeenCalledTimes(0);
  });

  test("CartRoutes_8.4: It should return a 403 if the user is not an admin or manager", async () => {
    // Mock middleware to set user as logged in but not an admin or manager
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      req.user = customerUser;
      next();
    });
    jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => res.status(403).end());

    // Make request to the route
    const response = await request(app).get(`${baseURL}/all`);

    // Assertions
    expect(response.status).toBe(403);
    expect(CartController.prototype.getAllCarts).toHaveBeenCalledTimes(0);
  });
});

