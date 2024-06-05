import {expect, jest, test} from "@jest/globals"

import CartDAO from "../../src/dao/cartDAO"
import db from "../../src/db/db"
import {Role, User} from "../../src/components/user";
import {Cart, ProductInCart} from "../../src/components/cart";
import {Category} from "../../src/components/product";
import {EmptyProductStockError, LowProductStockError, ProductNotFoundError} from "../../src/errors/productError";
import dayjs from "dayjs";
import {CartNotFoundError, EmptyCartError, ProductNotInCartError} from "../../src/errors/cartError";


interface databaseUser {
    username: string,
    name: string,
    surname: string,
    password: Buffer,
    role: string,
    address: string,
    birthdate: string,
    salt: Buffer
}

interface databaseCart {
    id: Number,
    customer: string,
    paid: boolean,
    paymentDate: string | null
}

interface databaseProductInCart {
    modelProduct: string,
    idCart: Number,
    quantityInCart: Number
}

interface databaseProduct {
    category: string,
    model: string,
    sellingPrice: Number,
    arrivalDate: string,
    details: string,
    quantity: Number
}

const dbUser: databaseUser = {
    username: "test",
    name: "test",
    surname: "test",
    password: Buffer.from("hashedPassword"),
    role: "Customer",
    address: "test",
    birthdate: "test",
    salt: Buffer.from("salt")
}

const dbCartEmpty: databaseCart = {
    id: 1,
    customer: dbUser.username,
    paid: false,
    paymentDate: null
}

const dbCartUnpaid: databaseCart = {
    id: 2,
    customer: dbUser.username,
    paid: false,
    paymentDate: null
}

const dbCartPaid1: databaseCart = {
    id: 3,
    customer: dbUser.username,
    paid: true,
    paymentDate: "2024-04-12"
}

const dbCartPaid2: databaseCart = {
    id: 4,
    customer: dbUser.username,
    paid: true,
    paymentDate: "2024-02-08"
}

const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
const prod1 = new ProductInCart("model1", 1, Category.SMARTPHONE, 500);
const prod2 = new ProductInCart("model2", 2, Category.SMARTPHONE, 250);
const prod3 = new ProductInCart("model3", 1, Category.LAPTOP, 1000);
const cartEmpty = new Cart(user.username, false, null, 0, []);
const cartUnpaid = new Cart(user.username, false, null, 2000, [prod1, prod2, prod3]);
const cartPaid1 = new Cart(user.username, true, dbCartPaid1.paymentDate, 2000, [prod1, prod2, prod3]);
const cartPaid2 = new Cart(user.username, true, dbCartPaid2.paymentDate, 1000, [prod1, prod2]);

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

    test("CartDAO_1.9: The model passed is not available (quantity == 0) (it should reject an EmptyProductStockError)", async () => {
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

describe("CartDAO_2: getCart method tests", () => {
    let mockDBGet: any;
    let mockDBAll: any;

    beforeEach(async () => {
        mockDBGet = jest.spyOn(db, "get");
        mockDBAll = jest.spyOn(db, "all");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("CartDAO_2.1: Get the current unpaid cart of a user (it should resolve the Cart object)", async () => {
        const cartDAO = new CartDAO();

        const prod1Info = {
            modelProduct: prod1.model,
            quantityInCart: prod1.quantity,
            category: prod1.category,
            sellingPrice: prod1.price,
        }
        const prod2Info = {
            modelProduct: prod2.model,
            quantityInCart: prod2.quantity,
            category: prod2.category,
            sellingPrice: prod2.price,
        }

        const prod3Info = {
            modelProduct: prod3.model,
            quantityInCart: prod3.quantity,
            category: prod3.category,
            sellingPrice: prod3.price,
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        });

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [prod1Info, prod2Info, prod3Info]);
        });


        const result = await cartDAO.getCart(user);

        expect(result).toEqual(cartUnpaid);
        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).toHaveBeenCalled();
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartUnpaid.id], expect.any(Function));
    });

    test("CartDAO_2.2: No information about an unpaid cart in the DB (it should resolve an empty Cart object)", async () => {
        const cartDAO = new CartDAO();

        const nullCart = new Cart("", null, null, 0, []);

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, undefined);
        });

        const result = await cartDAO.getCart(user);

        expect(result).toEqual(nullCart);
        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).not.toHaveBeenCalled();
    });

    test("CartDAO_2.3: Unpaid cart with no products found (it should resolve an empty Cart object)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartEmpty);
        });

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, []);
        });


        const result = await cartDAO.getCart(user);

        expect(result).toEqual(cartEmpty);
        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).toHaveBeenCalled();
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartEmpty.id], expect.any(Function));
    });

    test("CartDAO_2.4: An SQL error occurs in the SQLite get method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(new Error(), undefined);
        })

        await expect(cartDAO.getCart(user)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBAll).not.toHaveBeenCalled();
    });

    test("CartDAO_2.5: An SQL error occurs in the SQLite all method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(new Error(), undefined);
        })

        await expect(cartDAO.getCart(user)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBAll).toHaveBeenCalled();
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartUnpaid.id], expect.any(Function));
    });

    test("CartDAO_2.6: SQLite get method throws an Error (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, _callback: (err: (Error | null), row: any) => void) => {
            throw new Error();
        })

        await expect(cartDAO.getCart(user)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBAll).not.toHaveBeenCalled();
    });

    test("CartDAO_2.7: SQLite all method throws an Error (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, _callback: (err: (Error | null), row: any) => void) => {
            throw new Error();
        })

        await expect(cartDAO.getCart(user)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBAll).toHaveBeenCalled();
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartUnpaid.id], expect.any(Function));
    });
});

describe("CartDAO_3: checkoutCart method tests", () => {
    let mockDBGet: any;
    let mockDBAll: any;
    let mockDBRun: any;

    beforeEach(async () => {
        mockDBGet = jest.spyOn(db, "get");
        mockDBAll = jest.spyOn(db, "all");
        mockDBRun = jest.spyOn(db, "run");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("CartDAO_3.1: Checkout the current unpaid cart of a user successfully (it should resolve true)", async () => {
        const cartDAO = new CartDAO();

        const prod1Info = {
            modelProduct: prod1.model,
            quantityInCart: prod1.quantity,
            quantity: 50,
            sellingPrice: prod1.price,
        }
        const prod2Info = {
            modelProduct: prod2.model,
            quantityInCart: prod2.quantity,
            quantity: 21,
            sellingPrice: prod2.price,
        }

        const prod3Info = {
            modelProduct: prod3.model,
            quantityInCart: prod3.quantity,
            quantity: 48,
            sellingPrice: prod3.price,
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        });

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [prod1Info, prod2Info, prod3Info]);
        });

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        });

        const result = await cartDAO.checkoutCart(user);

        expect(result).toBe(true);
        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).toHaveBeenCalled();
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartUnpaid.id], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalled();
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [prod1Info.quantityInCart, prod1Info.modelProduct], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [prod2Info.quantityInCart, prod2Info.modelProduct], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [prod3Info.quantityInCart, prod3Info.modelProduct], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [dayjs().format("YYYY-MM-DD"), dbCartUnpaid.id], expect.any(Function));

    });

    test("CartDAO_3.2: No information about an unpaid cart in the DB (it should reject a CartNotFoundError)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, undefined);
        });

        await expect(cartDAO.checkoutCart(user)).rejects.toThrow(CartNotFoundError);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).not.toHaveBeenCalled();
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_3.3: The unpaid cart contains no product (it should reject a EmptyCartError)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartEmpty);
        });

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, []);
        });

        await expect(cartDAO.checkoutCart(user)).rejects.toThrow(EmptyCartError);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).toHaveBeenCalled();
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartEmpty.id], expect.any(Function));
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_3.4: At least one product in cart with an available quantity in stock == 0 (it should reject a EmptyProductStockError)", async () => {
        const cartDAO = new CartDAO();

        const prod1Info = {
            modelProduct: prod1.model,
            quantityInCart: prod1.quantity,
            quantity: 50,
            sellingPrice: prod1.price,
        }
        const prod2Info = {
            modelProduct: prod2.model,
            quantityInCart: prod2.quantity,
            quantity: 0,
            sellingPrice: prod2.price,
        }

        const prod3Info = {
            modelProduct: prod3.model,
            quantityInCart: prod3.quantity,
            quantity: 48,
            sellingPrice: prod3.price,
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        });

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [prod1Info, prod2Info, prod3Info]);
        });

        await expect(cartDAO.checkoutCart(user)).rejects.toThrow(EmptyProductStockError);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).toHaveBeenCalled();
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartUnpaid.id], expect.any(Function));
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_3.5: At least one product in cart with a quantity higher than what's available in stock (it should reject a LowProductStockError)", async () => {
        const cartDAO = new CartDAO();

        const prod1Info = {
            modelProduct: prod1.model,
            quantityInCart: prod1.quantity,
            quantity: 50,
            sellingPrice: prod1.price,
        }
        const prod2Info = {
            modelProduct: prod2.model,
            quantityInCart: prod2.quantity,
            quantity: 1,
            sellingPrice: prod2.price,
        }

        const prod3Info = {
            modelProduct: prod3.model,
            quantityInCart: prod3.quantity,
            quantity: 48,
            sellingPrice: prod3.price,
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        });

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [prod1Info, prod2Info, prod3Info]);
        });

        await expect(cartDAO.checkoutCart(user)).rejects.toThrow(LowProductStockError);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).toHaveBeenCalled();
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartUnpaid.id], expect.any(Function));
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_3.6: An SQL error occurs in the SQLite get method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(new Error(), undefined);
        });

        await expect(cartDAO.checkoutCart(user)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).not.toHaveBeenCalled();
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_3.7: An SQL error occurs in the SQLite all method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        });

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(new Error(), undefined);
        });

        await expect(cartDAO.checkoutCart(user)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).toHaveBeenCalled();
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartUnpaid.id], expect.any(Function));
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_3.8: An SQL error occurs in the SQLite run method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        const prod1Info = {
            modelProduct: prod1.model,
            quantityInCart: prod1.quantity,
            quantity: 50,
            sellingPrice: prod1.price,
        }
        const prod2Info = {
            modelProduct: prod2.model,
            quantityInCart: prod2.quantity,
            quantity: 21,
            sellingPrice: prod2.price,
        }

        const prod3Info = {
            modelProduct: prod3.model,
            quantityInCart: prod3.quantity,
            quantity: 48,
            sellingPrice: prod3.price,
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        });

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [prod1Info, prod2Info, prod3Info]);
        });

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(new Error());
        });


        await expect(cartDAO.checkoutCart(user)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).toHaveBeenCalled();
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartUnpaid.id], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalled();
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [prod1Info.quantityInCart, prod1Info.modelProduct], expect.any(Function));
    });

    test("CartDAO_3.9: An SQL error occurs in the SQLite run method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        const prod1Info = {
            modelProduct: prod1.model,
            quantityInCart: prod1.quantity,
            quantity: 50,
            sellingPrice: prod1.price,
        }
        const prod2Info = {
            modelProduct: prod2.model,
            quantityInCart: prod2.quantity,
            quantity: 21,
            sellingPrice: prod2.price,
        }

        const prod3Info = {
            modelProduct: prod3.model,
            quantityInCart: prod3.quantity,
            quantity: 48,
            sellingPrice: prod3.price,
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        });

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [prod1Info, prod2Info, prod3Info]);
        });

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
        callback(null);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
        callback(null);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
        callback(new Error());
        });


        await expect(cartDAO.checkoutCart(user)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).toHaveBeenCalled();
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartUnpaid.id], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalled();
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [prod1Info.quantityInCart, prod1Info.modelProduct], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [prod2Info.quantityInCart, prod2Info.modelProduct], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [prod3Info.quantityInCart, prod3Info.modelProduct], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [dayjs().format("YYYY-MM-DD"), dbCartUnpaid.id], expect.any(Function));
    });

    test("CartDAO_3.10: SQLite get method throws an Error (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, _callback: (err: (Error | null), row: any) => void) => {
            throw new Error();
        });

        await expect(cartDAO.checkoutCart(user)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).not.toHaveBeenCalled();
        expect(mockDBRun).not.toHaveBeenCalled();
    });
});

describe("CartDAO_4: getCustomerCarts method tests", () => {
    let mockDBAll: any;

    beforeEach(async () => {
        mockDBAll = jest.spyOn(db, "all");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("CartDAO_4.1: Get the history of carts paid for by the user (it should resolve an array of Carts)", async () => {
        const cartDAO = new CartDAO();
        const expected: Array<Cart> = [cartPaid1, cartPaid2];

        const prod1Info = {
            modelProduct: prod1.model,
            quantityInCart: prod1.quantity,
            category: prod1.category,
            sellingPrice: prod1.price,
        }
        const prod2Info = {
            modelProduct: prod2.model,
            quantityInCart: prod2.quantity,
            category: prod2.category,
            sellingPrice: prod2.price,
        }

        const prod3Info = {
            modelProduct: prod3.model,
            quantityInCart: prod3.quantity,
            category: prod3.category,
            sellingPrice: prod3.price,
        }

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [dbCartPaid1, dbCartPaid2]);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
        callback(null, [prod1Info, prod2Info, prod3Info]);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [prod1Info, prod2Info]);
        })

        const result = await cartDAO.getCustomerCarts(user);

        expect(result).toEqual(expected);
        expect(mockDBAll).toHaveBeenCalledTimes(3);
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartPaid1.id], expect.any(Function));
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartPaid2.id], expect.any(Function));
    });

    test("CartDAO_4.2: No paid carts found for the user (it should return an empty Array)", async () => {
        const cartDAO = new CartDAO();

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, []);
        })

        const result = await cartDAO.getCustomerCarts(user);

        expect(result).toEqual([]);
        expect(mockDBAll).toHaveBeenCalledTimes(1);
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
    });

    test("CartDAO_4.3: An SQL error occurs in the SQLite all method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(new Error(), undefined);
        })

        await expect(cartDAO.getCustomerCarts(user)).rejects.toThrow(Error);

        expect(mockDBAll).toHaveBeenCalledTimes(1);
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
    });

    test("CartDAO_4.4: An SQL error occurs in the SQLite all method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [dbCartPaid1, dbCartPaid2]);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(new Error(), undefined);
        })

        await expect(cartDAO.getCustomerCarts(user)).rejects.toThrow(Error);

        expect(mockDBAll).toHaveBeenCalledTimes(2);
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartPaid1.id], expect.any(Function));
    });

    test("CartDAO_4.5: An SQL error occurs in the SQLite all method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        const prod1Info = {
            modelProduct: prod1.model,
            quantityInCart: prod1.quantity,
            category: prod1.category,
            sellingPrice: prod1.price,
        }
        const prod2Info = {
            modelProduct: prod2.model,
            quantityInCart: prod2.quantity,
            category: prod2.category,
            sellingPrice: prod2.price,
        }

        const prod3Info = {
            modelProduct: prod3.model,
            quantityInCart: prod3.quantity,
            category: prod3.category,
            sellingPrice: prod3.price,
        }

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [dbCartPaid1, dbCartPaid2]);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [prod1Info, prod2Info, prod3Info]);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(new Error(), undefined);
        })

        await expect(cartDAO.getCustomerCarts(user)).rejects.toThrow(Error);

        expect(mockDBAll).toHaveBeenCalledTimes(3);
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartPaid1.id], expect.any(Function));
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartPaid2.id], expect.any(Function));
    });

    test("CartDAO_4.6: SQLite all method throws an Error (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, _callback: (err: (Error | null), rows: any[]) => void) => {
            throw new Error();
        })

        await expect(cartDAO.getCustomerCarts(user)).rejects.toThrow(Error);

        expect(mockDBAll).toHaveBeenCalledTimes(1);
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
    });

    test("CartDAO_4.7: SQLite all method throws an Error (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [dbCartPaid1, dbCartPaid2]);
        })
            .mockImplementationOnce((_sql: any, _params: any, _callback: (err: (Error | null), rows: any[]) => void) => {
                throw new Error();
            })

        await expect(cartDAO.getCustomerCarts(user)).rejects.toThrow(Error);

        expect(mockDBAll).toHaveBeenCalledTimes(2);
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function));
        expect(mockDBAll).toHaveBeenCalledWith(expect.any(String), [dbCartPaid1.id], expect.any(Function));
    });
});

describe("CartDAO_5: removeProductFromCart method tests", () => {
    let mockDBGet: any;
    let mockDBRun: any;

    beforeEach(async () => {
        mockDBGet = jest.spyOn(db, "get");
        mockDBRun = jest.spyOn(db, "run");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("CartDAO_5.1: The product in cart has a quantity > 1, which gets lowered correctly (it should resolve true)", async () => {
        const cartDAO = new CartDAO();

        const dbProd2: databaseProduct = {
            category: prod2.category,
            model: prod2.model,
            sellingPrice: prod2.price,
            arrivalDate: "2023-08-25",
            details: "details2",
            quantity: 50
        }

        const dbProdInCart2: databaseProductInCart = {
            modelProduct: dbProd2.model,
            idCart: dbCartUnpaid.id,
            quantityInCart: prod2.quantity
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbProd2);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbProdInCart2);
        })

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        });

        const result = await cartDAO.removeProductFromCart(user, prod1.model);

        expect(result).toBe(true);
        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
        expect(mockDBRun).toHaveBeenCalled();
        expect(mockDBRun).toHaveBeenCalledWith(expect.stringContaining("UPDATE"), [prod1.model, dbCartUnpaid.id], expect.any(Function))
    });

    test("CartDAO_5.2: The product in cart has a quantity == 1, so it gets removed from the cart (it should resolve true)", async () => {
        const cartDAO = new CartDAO();

        const dbProd1: databaseProduct = {
            category: prod1.category,
            model: prod1.model,
            sellingPrice: prod1.price,
            arrivalDate: "2023-08-25",
            details: "details1",
            quantity: 50
        }

        const dbProdInCart1: databaseProductInCart = {
            modelProduct: dbProd1.model,
            idCart: dbCartUnpaid.id,
            quantityInCart: prod1.quantity
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
            .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, dbProd1);
            })
            .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, dbProdInCart1);
            })

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        });

        const result = await cartDAO.removeProductFromCart(user, prod1.model);

        expect(result).toBe(true);
        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
        expect(mockDBRun).toHaveBeenCalled();
        expect(mockDBRun).toHaveBeenCalledWith(expect.stringContaining("DELETE"), [prod1.model, dbCartUnpaid.id], expect.any(Function))
    });

    test("CartDAO_5.3: No information about an unpaid cart found for the user (it should reject a CartNotFoundError)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, undefined);
        })

        await expect(cartDAO.removeProductFromCart(user, prod1.model)).rejects.toThrow(CartNotFoundError);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_5.4: The model passed does not present an existing product (it should reject ProductNotFoundError)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, undefined);
        })

        await expect(cartDAO.removeProductFromCart(user, prod1.model)).rejects.toThrow(ProductNotFoundError);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model], expect.any(Function))
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_5.5: The model passed represents a product that is not in the cart (it should reject a ProductNotInCartError", async () => {
        const cartDAO = new CartDAO();

        const dbProd1: databaseProduct = {
            category: prod1.category,
            model: prod1.model,
            sellingPrice: prod1.price,
            arrivalDate: "2023-08-25",
            details: "details1",
            quantity: 50
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbProd1);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, undefined);
        })

        await expect(cartDAO.removeProductFromCart(user, prod1.model)).rejects.toThrow(ProductNotInCartError);

        expect(mockDBGet).toHaveBeenCalled();
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_5.6: An SQL error occurs in the SQLite get method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();


        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(new Error(), undefined);
        })

        await expect(cartDAO.removeProductFromCart(user, prod1.model)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_5.7: An SQL error occurs in the SQLite get method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();


        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(new Error(), undefined);
        });

        await expect(cartDAO.removeProductFromCart(user, prod1.model)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalledTimes(2);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model], expect.any(Function))
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_5.8: An SQL error occurs in the SQLite get method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        const dbProd1: databaseProduct = {
            category: prod1.category,
            model: prod1.model,
            sellingPrice: prod1.price,
            arrivalDate: "2023-08-25",
            details: "details1",
            quantity: 50
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbProd1);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(new Error(), undefined);
        })

        await expect(cartDAO.removeProductFromCart(user, prod1.model)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalledTimes(3);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_5.9: An SQL error occurs in the SQLite run method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        const dbProd1: databaseProduct = {
            category: prod1.category,
            model: prod1.model,
            sellingPrice: prod1.price,
            arrivalDate: "2023-08-25",
            details: "details1",
            quantity: 50
        }

        const dbProdInCart1: databaseProductInCart = {
            modelProduct: dbProd1.model,
            idCart: dbCartUnpaid.id,
            quantityInCart: prod1.quantity
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbProd1);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbProdInCart1);
        })

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(new Error());
        });

        await expect(cartDAO.removeProductFromCart(user, prod1.model)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalledTimes(3);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
        expect(mockDBRun).toHaveBeenCalled();
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
        expect(mockDBRun).toHaveBeenCalledWith(expect.stringContaining("DELETE"), [prod1.model, dbCartUnpaid.id], expect.any(Function))
    });

    test("CartDAO_5.10: SQLite get method throws an Error (it should reject the error)", async () => {
        const cartDAO = new CartDAO();


        mockDBGet.mockImplementationOnce((_sql: any, _params: any, _callback: (err: (Error | null), row: any) => void) => {
            throw new Error();
        })

        await expect(cartDAO.removeProductFromCart(user, prod1.model)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBRun).not.toHaveBeenCalled();
    });

    test("CartDAO_5.11: SQLite run method throws an Error (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        const dbProd1: databaseProduct = {
            category: prod1.category,
            model: prod1.model,
            sellingPrice: prod1.price,
            arrivalDate: "2023-08-25",
            details: "details1",
            quantity: 50
        }

        const dbProdInCart1: databaseProductInCart = {
            modelProduct: dbProd1.model,
            idCart: dbCartUnpaid.id,
            quantityInCart: prod1.quantity
        }

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })
            .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, dbProd1);
            })
            .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, dbProdInCart1);
            })

        mockDBRun.mockImplementation((_sql: any, _params: any, _callback: (err: (Error | null)) => void) => {
            throw new Error();
        });

        await expect(cartDAO.removeProductFromCart(user, prod1.model)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalledTimes(3);
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [user.username], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model], expect.any(Function))
        expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
        expect(mockDBRun).toHaveBeenCalled();
        expect(mockDBRun).toHaveBeenCalledWith(expect.any(String), [prod1.model, dbCartUnpaid.id], expect.any(Function))
        expect(mockDBRun).toHaveBeenCalledWith(expect.stringContaining("DELETE"), [prod1.model, dbCartUnpaid.id], expect.any(Function))
    });
});

describe("CartDAO_6: clearCart method tests", () => {
    let mockDBGet: any;
    let mockDBRun: any;

    beforeEach(async () => {
        mockDBGet = jest.spyOn(db, "get");
        mockDBRun = jest.spyOn(db, "run");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("CartDAO_6.1: Clear the current cart of the user (it should resolve true)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        })

        const result = await cartDAO.clearCart(user);

        expect(result).toBe(true);
        expect(mockDBGet).toHaveBeenCalled()
        expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [user.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalled()
        expect(mockDBRun).toHaveBeenCalledWith(expect.stringContaining("DELETE"), [dbCartUnpaid.id], expect.any(Function));
    });

    test("CartDAO_6.2: No information about an unpaid cart for the user (it should reject a CartNotFoundError)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, undefined);
        })

        await expect(cartDAO.clearCart(user)).rejects.toThrow(CartNotFoundError);

        expect(mockDBGet).toHaveBeenCalled()
        expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [user.username], expect.any(Function));
        expect(mockDBRun).not.toHaveBeenCalled()
    });

    test("CartDAO_6.3: An SQL error occurs in the SQLite get method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(new Error(), undefined);
        })

        await expect(cartDAO.clearCart(user)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled()
        expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [user.username], expect.any(Function));
        expect(mockDBRun).not.toHaveBeenCalled()
    });

    test("CartDAO_6.4: An SQL error occurs in the SQLite run method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(new Error());
        })

        await expect(cartDAO.clearCart(user)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled()
        expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [user.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalled()
        expect(mockDBRun).toHaveBeenCalledWith(expect.stringContaining("DELETE"), [dbCartUnpaid.id], expect.any(Function));
    });

    test("CartDAO_6.5: SQLite get method throws an Error (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, _callback: (err: (Error | null), row: any) => void) => {
            throw new Error();
        })

        await expect(cartDAO.clearCart(user)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled()
        expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [user.username], expect.any(Function));
        expect(mockDBRun).not.toHaveBeenCalled()
    });

    test("CartDAO_6.6: SQLite run method throws an Error (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
            callback(null, dbCartUnpaid);
        })

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, _callback: (err: (Error | null)) => void) => {
            throw new Error();
        })

        await expect(cartDAO.clearCart(user)).rejects.toThrow(Error);

        expect(mockDBGet).toHaveBeenCalled()
        expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [user.username], expect.any(Function));
        expect(mockDBRun).toHaveBeenCalled()
        expect(mockDBRun).toHaveBeenCalledWith(expect.stringContaining("DELETE"), [dbCartUnpaid.id], expect.any(Function));
    });
});

describe("CartDAO_7: deleteAllCarts method tests", () => {
    let mockDBRun: any;

    beforeEach(async () => {
        mockDBRun = jest.spyOn(db, "run");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("CartDAO_7.1: Delete all existing carts of all users (it should resolve true)", async () => {
        const cartDAO = new CartDAO();

        mockDBRun.mockImplementation((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        })

        const result = await cartDAO.deleteAllCarts();

        expect(result).toBe(true);
        expect(mockDBRun).toHaveBeenCalledTimes(2);
        expect(mockDBRun).toHaveBeenNthCalledWith(1, expect.stringContaining("DELETE"), [], expect.any(Function));
        expect(mockDBRun).toHaveBeenNthCalledWith(2, expect.stringContaining("DELETE"), [], expect.any(Function));
    });

    test("CartDAO_7.2: An SQL error occurs in the SQLite run method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(new Error());
        })

        await expect(cartDAO.deleteAllCarts()).rejects.toThrow(Error);

        expect(mockDBRun).toHaveBeenCalledTimes(1);
        expect(mockDBRun).toHaveBeenCalledWith(expect.stringContaining("DELETE"), [], expect.any(Function));
    });

    test("CartDAO_7.3: An SQL error occurs in the SQLite run method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(null);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
            callback(new Error());
        })

        await expect(cartDAO.deleteAllCarts()).rejects.toThrow(Error);

        expect(mockDBRun).toHaveBeenCalledTimes(2);
        expect(mockDBRun).toHaveBeenNthCalledWith(1, expect.stringContaining("DELETE"), [], expect.any(Function));
        expect(mockDBRun).toHaveBeenNthCalledWith(2, expect.stringContaining("DELETE"), [], expect.any(Function));
    });

    test("CartDAO_7.4: SQLite run method throws an Error (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBRun.mockImplementationOnce((_sql: any, _params: any, _callback: (err: (Error | null)) => void) => {
            throw new Error();
        })

        await expect(cartDAO.deleteAllCarts()).rejects.toThrow(Error);

        expect(mockDBRun).toHaveBeenCalledTimes(1);
        expect(mockDBRun).toHaveBeenCalledWith(expect.stringContaining("DELETE"), [], expect.any(Function));
    });
});

describe("CartDAO_8: getAllCarts method tests", () => {
    let mockDBAll: any;

    beforeEach(async () => {
        mockDBAll = jest.spyOn(db, "all");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("CartDAO_8.1: Get all existing carts of all users (it should resolve true)", async () => {
        const cartDAO = new CartDAO();
        const expected: Array<Cart> = [cartEmpty, cartPaid1, cartPaid2];

        const prod1Info = {
            modelProduct: prod1.model,
            quantityInCart: prod1.quantity,
            category: prod1.category,
            sellingPrice: prod1.price,
        }
        const prod2Info = {
            modelProduct: prod2.model,
            quantityInCart: prod2.quantity,
            category: prod2.category,
            sellingPrice: prod2.price,
        }

        const prod3Info = {
            modelProduct: prod3.model,
            quantityInCart: prod3.quantity,
            category: prod3.category,
            sellingPrice: prod3.price,
        }

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [dbCartEmpty, dbCartPaid1, dbCartPaid2]);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, []);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [prod1Info, prod2Info, prod3Info]);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [prod1Info, prod2Info]);
        })

        const result = await cartDAO.getAllCarts();

        expect(result).toEqual(expected);
        expect(mockDBAll).toHaveBeenCalledTimes(4);
        expect(mockDBAll).toHaveBeenNthCalledWith(1, expect.any(String), [], expect.any(Function));
        expect(mockDBAll).toHaveBeenNthCalledWith(2, expect.any(String), [dbCartEmpty.id], expect.any(Function));
        expect(mockDBAll).toHaveBeenNthCalledWith(3, expect.any(String), [dbCartPaid1.id], expect.any(Function));
        expect(mockDBAll).toHaveBeenNthCalledWith(4, expect.any(String), [dbCartPaid2.id], expect.any(Function));
    });

    test("CartDAO_8.2: An SQL error occurs in the SQLite all method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(new Error(), undefined);
        })

        await expect(cartDAO.getAllCarts()).rejects.toThrow(Error);

        expect(mockDBAll).toHaveBeenCalledTimes(1);
        expect(mockDBAll).toHaveBeenNthCalledWith(1, expect.any(String), [], expect.any(Function));
    });

    test("CartDAO_8.3: An SQL error occurs in the SQLite run method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [dbCartEmpty, dbCartPaid1, dbCartPaid2]);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(new Error(), undefined);
        })

        await expect(cartDAO.getAllCarts()).rejects.toThrow(Error);

        expect(mockDBAll).toHaveBeenCalledTimes(2);
        expect(mockDBAll).toHaveBeenNthCalledWith(1, expect.any(String), [], expect.any(Function));
        expect(mockDBAll).toHaveBeenNthCalledWith(2, expect.any(String), [dbCartEmpty.id], expect.any(Function));
    });

    test("CartDAO_8.4: An SQL error occurs in the SQLite run method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [dbCartEmpty, dbCartPaid1, dbCartPaid2]);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, []);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(new Error(), undefined);
        })

        await expect(cartDAO.getAllCarts()).rejects.toThrow(Error);

        expect(mockDBAll).toHaveBeenCalledTimes(3);
        expect(mockDBAll).toHaveBeenNthCalledWith(1, expect.any(String), [], expect.any(Function));
        expect(mockDBAll).toHaveBeenNthCalledWith(2, expect.any(String), [dbCartEmpty.id], expect.any(Function));
        expect(mockDBAll).toHaveBeenNthCalledWith(3, expect.any(String), [dbCartPaid1.id], expect.any(Function));
    });

    test("CartDAO_8.5: An SQL error occurs in the SQLite run method and it's passed to the callback (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        const prod1Info = {
            modelProduct: prod1.model,
            quantityInCart: prod1.quantity,
            category: prod1.category,
            sellingPrice: prod1.price,
        }
        const prod2Info = {
            modelProduct: prod2.model,
            quantityInCart: prod2.quantity,
            category: prod2.category,
            sellingPrice: prod2.price,
        }

        const prod3Info = {
            modelProduct: prod3.model,
            quantityInCart: prod3.quantity,
            category: prod3.category,
            sellingPrice: prod3.price,
        }

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [dbCartEmpty, dbCartPaid1, dbCartPaid2]);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, []);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [prod1Info, prod2Info, prod3Info]);
        })
        .mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(new Error(), undefined);
        })

        await expect(cartDAO.getAllCarts()).rejects.toThrow(Error);

        expect(mockDBAll).toHaveBeenCalledTimes(4);
        expect(mockDBAll).toHaveBeenNthCalledWith(1, expect.any(String), [], expect.any(Function));
        expect(mockDBAll).toHaveBeenNthCalledWith(2, expect.any(String), [dbCartEmpty.id], expect.any(Function));
        expect(mockDBAll).toHaveBeenNthCalledWith(3, expect.any(String), [dbCartPaid1.id], expect.any(Function));
        expect(mockDBAll).toHaveBeenNthCalledWith(4, expect.any(String), [dbCartPaid2.id], expect.any(Function));
    });

    test("CartDAO_8.6: SQLite all method throws an Error (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, _callback: (err: (Error | null), rows: any[]) => void) => {
            throw new Error();
        })

        await expect(cartDAO.getAllCarts()).rejects.toThrow(Error);

        expect(mockDBAll).toHaveBeenCalledTimes(1);
        expect(mockDBAll).toHaveBeenNthCalledWith(1, expect.any(String), [], expect.any(Function));
    });

    test("CartDAO_8.7: SQLite all method throws an Error (it should reject the error)", async () => {
        const cartDAO = new CartDAO();

        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), rows: any[]) => void) => {
            callback(null, [dbCartEmpty, dbCartPaid1, dbCartPaid2]);
        })
        .mockImplementationOnce((_sql: any, _params: any, _callback: (err: (Error | null), rows: any[]) => void) => {
            throw new Error();
        })

        await expect(cartDAO.getAllCarts()).rejects.toThrow(Error);

        expect(mockDBAll).toHaveBeenCalledTimes(2);
        expect(mockDBAll).toHaveBeenNthCalledWith(1, expect.any(String), [], expect.any(Function));
        expect(mockDBAll).toHaveBeenNthCalledWith(2, expect.any(String), [dbCartEmpty.id], expect.any(Function));
    });
});