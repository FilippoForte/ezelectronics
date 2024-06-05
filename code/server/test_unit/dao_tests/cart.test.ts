import {expect, jest, test} from "@jest/globals"

import CartDAO from "../../src/dao/cartDAO"
import db from "../../src/db/db"
import {Role, User} from "../../src/components/user";
import {Cart, ProductInCart} from "../../src/components/cart";
import {Category} from "../../src/components/product";
import {EmptyProductStockError, ProductNotFoundError} from "../../src/errors/productError";


interface databaseUserRow {
    username: String,
    name: String,
    surname: String,
    password: Buffer,
    role: String,
    address: String,
    birthdate: String,
    salt: Buffer
}

interface databaseUserCart {
    id: Number,
    customer: String,
    paid: boolean,
    paymentDate: String | null
}

interface databaseProductInCart {
    modelProduct: String,
    idCart: Number,
    quantityInCart: Number
}

interface databaseProduct {
    category: String,
    model: String,
    sellingPrice: Number,
    arrivalDate: String,
    details: String,
    quantity: Number
}

const dbUser: databaseUserRow = {
    username: "test",
    name: "test",
    surname: "test",
    password: Buffer.from("hashedPassword"),
    role: "Customer",
    address: "test",
    birthdate: "test",
    salt: Buffer.from("salt")
}

const dbCartEmpty: databaseUserCart = {
    id: 1,
    customer: dbUser.username,
    paid: false,
    paymentDate: null
}

const dbCartUnpaid: databaseUserCart = {
    id: 2,
    customer: dbUser.username,
    paid: false,
    paymentDate: null
}

const dbCartPaid: databaseUserCart = {
    id: 3,
    customer: dbUser.username,
    paid: true,
    paymentDate: "2024-04-12"
}

const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
const prod1 = new ProductInCart("model1", 1, Category.SMARTPHONE, 500);
const prod2 = new ProductInCart("model2", 2, Category.SMARTPHONE, 250);
const prod3 = new ProductInCart("model3", 1, Category.LAPTOP, 1000);
const cartEmpty = new Cart(user.username, false, null, 0, []);
const cartUnpaid = new Cart(user.username, false, null, 2000, [prod1, prod2, prod3]);
const cartPaid = new Cart(user.username, true, "2024-04-12", 2000, [prod1, prod2, prod3]);

describe("CartDAO_1: addToCart method tests", () => {
    let mockDBGet: any;
    let mockDBRun: any;

    beforeEach(async () => {
        mockDBGet = jest.spyOn(db, "get");
        mockDBRun = jest.spyOn(db, "run");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("CartDAO_1.1: No information about the current unpaid cart of the user in the DB (it should resolve true)", async () => {
        const cartDAO = new CartDAO();
        const dbProd1: databaseProduct = {
            category: Category.SMARTPHONE,
            model: "model1",
            sellingPrice: 500,
            arrivalDate: "2023-08-25",
            details: "details1",
            quantity: 50
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, undefined);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartEmpty);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbProd1);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, undefined);
        });

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        });

        const result = await cartDAO.addToCart(user, prod1.model);

        expect(result).toBe(true);
        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartEmpty.id], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model], expect.any(Function))
        expect(mockDBRun).toHaveBeenCalled();
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [user.username, false, null], expect.any(Function))
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartEmpty.id], expect.any(Function))
    });

    test("CartDAO_1.2: Unpaid cart found, no instance of the product in the cart (it should resolve true)", async () => {
        const cartDAO = new CartDAO();
        const dbProd1: databaseProduct = {
            category: Category.SMARTPHONE,
            model: "model1",
            sellingPrice: 500,
            arrivalDate: "2023-08-25",
            details: "details1",
            quantity: 50
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbProd1);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, undefined);
        });

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        });

        const result = await cartDAO.addToCart(user, prod1.model);

        expect(result).toBe(true);
        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model], expect.any(Function))
        expect(mockDBRun).toHaveBeenCalled();
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
    });

    test("CartDAO_1.3: Unpaid cart found, instance of the product found (it should resolve true)", async () => {
        const cartDAO = new CartDAO();
        const dbProdInCart1: databaseProductInCart = {
            modelProduct: prod1.model,
            idCart: dbCartUnpaid.id,
            quantityInCart: prod1.quantity
        };
        const dbProd1: databaseProduct = {
            category: Category.SMARTPHONE,
            model: "model1",
            sellingPrice: 500,
            arrivalDate: "2023-08-25",
            details: "details1",
            quantity: 50
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbProd1);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbProdInCart1);
        });

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        });

        const result = await cartDAO.addToCart(user, prod1.model);

        expect(result).toBe(true);
        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model], expect.any(Function))
        expect(mockDBRun).toHaveBeenCalled();
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
    });

    test("CartDAO_1.4: An SQL error occurs in the SQLite get method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(new Error(), undefined);
        })

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        });

        await expect(cartDAO.addToCart(user, prod1.model)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_1.5: An SQL error occurs in the SQLite get method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartEmpty);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(new Error(), undefined);
        })

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        });

        await expect(cartDAO.addToCart(user, prod1.model)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_1.6: An SQL error occurs in the SQLite get method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(new Error(), undefined);
        })

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        });

        await expect(cartDAO.addToCart(user, prod1.model)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model], expect.any(Function))
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_1.7: An SQL error occurs in the SQLite get method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();
        const dbProd1: databaseProduct = {
            category: Category.SMARTPHONE,
            model: "model1",
            sellingPrice: 500,
            arrivalDate: "2023-08-25",
            details: "details1",
            quantity: 50
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbProd1);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(new Error(), undefined);
        })

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        });

        await expect(cartDAO.addToCart(user, prod1.model)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model], expect.any(Function))
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_1.8: The model passed does not exist in the DB (it should reject a ProductNotFoundError)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, undefined);
        })

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        });

        await expect(cartDAO.addToCart(user, prod1.model)).rejects.toThrow(ProductNotFoundError);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model], expect.any(Function))
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_1.9: The model passed is not available (quantity == 0) (it should reject a EmptyProductStockError)", async () => {
        const cartDAO = new CartDAO();
        const dbProd1: databaseProduct = {
            category: Category.SMARTPHONE,
            model: "model1",
            sellingPrice: 500,
            arrivalDate: "2023-08-25",
            details: "details1",
            quantity: 0
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
            .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, dbCartUnpaid);
            })
            .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, dbProd1);
            })

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        });

        await expect(cartDAO.addToCart(user, prod1.model)).rejects.toThrow(EmptyProductStockError);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model], expect.any(Function))
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_1.10: An SQL error occurs in the SQLite run method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();


        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, undefined);
        })

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(new Error());
        });

        await expect(cartDAO.addToCart(user, prod1.model)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBRun).toHaveBeenCalled();
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [user.username, false, null], expect.any(Function))
    });

    test("CartDAO_1.11: An SQL error occurs in the SQLite run method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();
        const dbProd1: databaseProduct = {
            category: Category.SMARTPHONE,
            model: "model1",
            sellingPrice: 500,
            arrivalDate: "2023-08-25",
            details: "details1",
            quantity: 50
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbProd1);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, undefined);
        });

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(new Error());
        });

        await expect(cartDAO.addToCart(user, prod1.model)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
        expect(mockDBRun).toHaveBeenCalled();
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
    });

    test("CartDAO_1.12: SQLite get method throws an Error (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, _callback: (err: (Error | null), row: any) => void) => {
            throw new Error();
        })

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        });

        await expect(cartDAO.addToCart(user, prod1.model)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_1.13: SQLite run method throws an Error (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, undefined);
        })

        mockDBRun.mockImplementation((_sql: any, _params: any, _callback: (err: (Error | null)) => void) => {
            throw new Error();
        });

        await expect(cartDAO.addToCart(user, prod1.model)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBRun).toHaveBeenCalled();
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [user.username, false, null], expect.any(Function))
    });
});