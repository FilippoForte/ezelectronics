import { describe, test, expect} from "@jest/globals";
import request from 'supertest';
import { app } from "../../index";
import db from "../../src/db/db";
import CartDAO from "../../src/dao/cartDAO";
import { Role, User } from "../../src/components/user";
import CartController from "../../src/controllers/cartController";
import { Cart, ProductInCart } from "../../src/components/cart";

jest.mock("../../src/dao/cartDAO");

describe("CartController_1: addToCart method tests", () => {
    test("CartController_1.1: It should return true", async () => {
        const model = "iPhoneX";
        const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        jest.spyOn(CartDAO.prototype, "addToCart").mockResolvedValueOnce(true);
        const controller = new CartController();
        const response = await controller.addToCart(user, model);
        expect(CartDAO.prototype.addToCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.addToCart).toHaveBeenCalledWith(user, model);
        expect(response).toBe(true);
    });
});

describe("CartController_2: getCart method tests", () => {
    test("CartController_2.1: It should return Cart", async () => {
        const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        let products: ProductInCart[] = [];
        let cart: Cart = new Cart("test", false, "test", 0, products);
        jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(cart);
        const controller = new CartController();
        const response = await controller.getCart(user);
        expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getCart).toHaveBeenCalledWith(user);
        expect(response).toBe(cart);
    });
});

describe("CartController_3: checkoutCart method tests", () => {
    test("CartController_3.1: It should return true", async () => {
        const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        jest.spyOn(CartDAO.prototype, "checkoutCart").mockResolvedValueOnce(true);
        const controller = new CartController();
        const response = await controller.checkoutCart(user);
        expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledWith(user);
        expect(response).toBe(true);
    });
});

describe("CartController_4: getCustomerCarts method tests", () => {
    test("CartController_4.1: It should return Cart[]", async () => {
        const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        let products: ProductInCart[] = [];
        let carts: Cart[] = [];
        carts.push(new Cart("test", false, "test", 0, products));
        jest.spyOn(CartDAO.prototype, "getCustomerCarts").mockResolvedValueOnce(carts);
        const controller = new CartController();
        const response = await controller.getCustomerCarts(user);
        expect(CartDAO.prototype.getCustomerCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getCustomerCarts).toHaveBeenCalledWith(user);
        expect(response).toBe(carts);
    });
});

describe("CartController_5: removeProductFromCart method tests", () => {
    test("CartController_5.1: It should return true", async () => {
        const model = "iPhoneX";
        const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        jest.spyOn(CartDAO.prototype, "removeProductFromCart").mockResolvedValueOnce(true);
        const controller = new CartController();
        const response = await controller.removeProductFromCart(user, model);
        expect(CartDAO.prototype.removeProductFromCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.removeProductFromCart).toHaveBeenCalledWith(user, model);
        expect(response).toBe(true);
    });
});

describe("CartController_6: clearCart method tests", () => {
    test("CartController_6.1: It should return true", async () => {
        const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        jest.spyOn(CartDAO.prototype, "clearCart").mockResolvedValueOnce(true);
        const controller = new CartController();
        const response = await controller.clearCart(user);
        expect(CartDAO.prototype.clearCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.clearCart).toHaveBeenCalledWith(user);
        expect(response).toBe(true);
    });
});

describe("CartController_7: deleteAllCarts method tests", () => {
    test("CartController_7.1: It should return true", async () => {
        jest.spyOn(CartDAO.prototype, "deleteAllCarts").mockResolvedValueOnce(true);
        const controller = new CartController();
        const response = await controller.deleteAllCarts();
        expect(CartDAO.prototype.deleteAllCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.deleteAllCarts).toHaveBeenCalledWith();
        expect(response).toBe(true);
    });
});

describe("CartController_8: getAllCarts method tests", () => {
    test("CartController_8.1: It should return Cart[]", async () => {
        let products: ProductInCart[] = [];
        let carts: Cart[] = [];
        carts.push(new Cart("test", false, "test", 0, products));
        jest.spyOn(CartDAO.prototype, "getAllCarts").mockResolvedValueOnce(carts);
        const controller = new CartController();
        const response = await controller.getAllCarts();
        expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledWith();
        expect(response).toBe(carts);
    });
});