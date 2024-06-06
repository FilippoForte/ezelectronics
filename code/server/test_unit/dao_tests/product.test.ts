import {expect, jest, test} from "@jest/globals";
import db from "../../src/db/db";
import {Category, Product} from "../../src/components/product";
import ProductDAO from "../../src/dao/productDAO";
import dayjs from "dayjs";
import {FutureDateError, ProductAlreadyExistsError, ProductNotFoundError} from "../../src/errors/productError";

interface databaseProduct {
    category: string,
    model: string,
    sellingPrice: number,
    arrivalDate: string,
    details: string,
    quantity: number
}

const dbProdNoDate: databaseProduct = {
    category: Category.SMARTPHONE,
    model: "iPhone 13",
    sellingPrice: 600,
    arrivalDate: null,
    details: "",
    quantity: 5
}

const dbProdFutureDate: databaseProduct = {
    category: Category.SMARTPHONE,
    model: "iPhone 13",
    sellingPrice: 600,
    arrivalDate: "2456-12-31",
    details: "",
    quantity: 10
}

const dbProdPastDate: databaseProduct = {
    category: Category.SMARTPHONE,
    model: "iPhone 13",
    sellingPrice: 600,
    arrivalDate: "1492-10-12",
    details: "",
    quantity: 10
}

const dbProdOkDate: databaseProduct = {
    category: Category.SMARTPHONE,
    model: "iPhone 13",
    sellingPrice: 600,
    arrivalDate: "2024-05-16",
    details: "",
    quantity: 15
}

const dbProd1: databaseProduct = {
    category: Category.SMARTPHONE,
    model: "iPhone 13",
    sellingPrice: 600,
    arrivalDate: "2024-05-16",
    details: "",
    quantity: 5
}

const dbProd2: databaseProduct = {
    category: Category.LAPTOP,
    model: "OMEN 16 2024",
    sellingPrice: 1900,
    arrivalDate: "2023-12-03",
    details: "",
    quantity: 15
}

const dbProd3: databaseProduct = {
    category: Category.LAPTOP,
    model: "ASUS ROG Zephyrus G16",
    sellingPrice: 1550,
    arrivalDate: "2023-10-13",
    details: "",
    quantity: 15
}

const prod1 = new Product(dbProd1.sellingPrice, dbProd1.model, Category.SMARTPHONE, dbProd1.arrivalDate, dbProd1.details, dbProd1.quantity);
const prod2 = new Product(dbProd2.sellingPrice, dbProd2.model, Category.LAPTOP, dbProd2.arrivalDate, dbProd2.details, dbProd2.quantity);
const prod3 = new Product(dbProd3.sellingPrice, dbProd3.model, Category.LAPTOP, dbProd3.arrivalDate, dbProd3.details, dbProd3.quantity);

describe("Product DAO unit tests", () => {
    describe("ProductDAO_1: registerProducts method tests", () => {
        let mockDBGet: any;
        let mockDBRun: any;

        beforeEach(async () => {
            mockDBGet = jest.spyOn(db, "get");
            mockDBRun = jest.spyOn(db, "run");
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test("ProductDAO_1.1: Register the arrival of a new set of products correctly (it should resolve true)", async () => {
            const productDAO = new ProductDAO();

            mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, undefined);
            })

            mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
                callback(null);
            });

            const result = await productDAO.registerProducts(dbProdNoDate.model, dbProdNoDate.category, dbProdNoDate.quantity, dbProdNoDate.details, dbProdNoDate.sellingPrice, dbProdNoDate.arrivalDate);

            expect(result).toBe(true);
            expect(mockDBGet).toHaveBeenCalled();
            expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [dbProdNoDate.model], expect.any(Function))
            expect(mockDBRun).toHaveBeenCalled();
            expect(mockDBRun).toHaveBeenCalledWith(expect.stringContaining("INSERT"), expect.arrayContaining(
                [dbProdNoDate.model, dbProdNoDate.category, dbProdNoDate.quantity, dbProdNoDate.details, dbProdNoDate.sellingPrice, dayjs().format("YYYY-MM-DD")]),
                expect.any(Function));
        });

        test("ProductDAO_1.2: Try to register an already existing set of products (it should reject ProductAlreadyExistsError)", async () => {
            const productDAO = new ProductDAO();

            mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, dbProdNoDate);
            })

            await expect(productDAO.registerProducts(dbProdNoDate.model, dbProdNoDate.category, dbProdNoDate.quantity, dbProdNoDate.details, dbProdNoDate.sellingPrice, dbProdNoDate.arrivalDate))
                .rejects
                .toThrow(ProductAlreadyExistsError);

            expect(mockDBGet).toHaveBeenCalled();
            expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [dbProdNoDate.model], expect.any(Function))
            expect(mockDBRun).not.toHaveBeenCalled();
        });

        test("ProductDAO_1.3: arrivalDate is after the current date (it should reject FutureDateError)", async () => {
            const productDAO = new ProductDAO();

            await expect(productDAO.registerProducts(dbProdFutureDate.model, dbProdFutureDate.category, dbProdFutureDate.quantity, dbProdFutureDate.details, dbProdFutureDate.sellingPrice, dbProdFutureDate.arrivalDate))
                .rejects
                .toThrow(FutureDateError);

            expect(mockDBGet).not.toHaveBeenCalled();
            expect(mockDBRun).not.toHaveBeenCalled();
        });

        test("ProductDAO_1.4: An SQL error occurs in the SQLite get method and it's passed to the callback (it should reject the error)", async () => {
            const productDAO = new ProductDAO();

            mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(new Error(), undefined);
            })

            try {
                await productDAO.registerProducts(dbProdNoDate.model, dbProdNoDate.category, dbProdNoDate.quantity, dbProdNoDate.details, dbProdNoDate.sellingPrice, dbProdNoDate.arrivalDate);
            }
            catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(Object.getPrototypeOf(error)).toBe(Error.prototype);
            }

            expect(mockDBGet).toHaveBeenCalled();
            expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [dbProdNoDate.model], expect.any(Function))
            expect(mockDBRun).not.toHaveBeenCalled();
        });

        test("ProductDAO_1.5: An SQL error occurs in the SQLite run method and it's passed to the callback (it should reject the error)", async () => {
            const productDAO = new ProductDAO();

            mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, dbProdOkDate);
            })

            mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
                callback(new Error());
            })

            try {
                await productDAO.registerProducts(dbProdOkDate.model, dbProdOkDate.category, dbProdOkDate.quantity, dbProdOkDate.details, dbProdOkDate.sellingPrice, dbProdOkDate.arrivalDate);
            }
            catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(Object.getPrototypeOf(error)).toBe(Error.prototype);
            }

            expect(mockDBGet).toHaveBeenCalled();
            expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [dbProdOkDate.model], expect.any(Function));
            expect(mockDBRun).toHaveBeenCalled();
            expect(mockDBRun).toHaveBeenCalledWith(expect.stringContaining("INSERT"), expect.arrayContaining(
                    [dbProdOkDate.model, dbProdOkDate.category, dbProdOkDate.quantity, dbProdOkDate.details, dbProdOkDate.sellingPrice, dayjs().format("YYYY-MM-DD")]),
                expect.any(Function));
        });

        test("ProductDAO_1.6: SQLite get method throws an Error (it should reject the error)", async () => {
            const productDAO = new ProductDAO();

            mockDBGet.mockImplementationOnce((_sql: any, _params: any, _callback: (err: (Error | null), row: any) => void) => {
                throw new Error();
            })

            await expect(productDAO.registerProducts(dbProdOkDate.model, dbProdOkDate.category, dbProdOkDate.quantity, dbProdOkDate.details, dbProdOkDate.sellingPrice, dbProdOkDate.arrivalDate))
                .rejects
                .toThrow(Error);

            expect(mockDBGet).toHaveBeenCalled();
            expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [dbProdOkDate.model], expect.any(Function))
            expect(mockDBRun).not.toHaveBeenCalled();
        });
    });

    describe("ProductDAO_2: changeProductQuantity method tests", () => {
        let mockDBGet: any;
        let mockDBRun: any;

        beforeEach(async () => {
            mockDBGet = jest.spyOn(db, "get");
            mockDBRun = jest.spyOn(db, "run");
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test("ProductDAO_2.1: Increase the available quantity of a set of products correctly, set arrivalDate to the current date (it should resolve the new quantity)", async () => {
            const productDAO = new ProductDAO();

            mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, dbProdOkDate);
            })

            mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
                callback(null);
            });

            const result = await productDAO.changeProductQuantity(dbProdNoDate.model, dbProdNoDate.quantity, dbProdNoDate.arrivalDate);

            expect(result).toEqual(20);
            expect(mockDBGet).toHaveBeenCalled();
            expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [dbProdNoDate.model], expect.any(Function))
            expect(mockDBRun).toHaveBeenCalled();
            expect(mockDBRun).toHaveBeenCalledWith(expect.stringContaining("UPDATE"), expect.arrayContaining(
                    [dbProdNoDate.model, dbProdNoDate.quantity]),
                expect.any(Function));
        });

        test("ProductDAO_2.2: Increase the available quantity of a set of products correctly, the new arrivalDate is provided (it should resolve the new quantity)", async () => {
            const productDAO = new ProductDAO();

            const dbProdNewDate: databaseProduct = {
                category: Category.SMARTPHONE,
                model: "iPhone 13",
                sellingPrice: 600,
                arrivalDate: "2024-06-02",
                details: "",
                quantity: 15
            }

            mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, dbProdOkDate);
            })

            mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
                callback(null);
            });

            const result = await productDAO.changeProductQuantity(dbProdNewDate.model, dbProdNewDate.quantity, dbProdNewDate.arrivalDate);

            expect(result).toEqual(30);
            expect(mockDBGet).toHaveBeenCalled();
            expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [dbProdNewDate.model], expect.any(Function))
            expect(mockDBRun).toHaveBeenCalled();
            expect(mockDBRun).toHaveBeenCalledWith(expect.stringContaining("UPDATE"), expect.arrayContaining(
                    [dbProdNewDate.model, dbProdNewDate.quantity]),
                expect.any(Function));
        });

        test("ProductDAO_2.3: The provided model does not represent a product in the database (it should reject a ProductNotFoundError)", async () => {
            const productDAO = new ProductDAO();

            mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, undefined);
            })

            await expect(productDAO.changeProductQuantity(dbProdNoDate.model, dbProdNoDate.quantity, dbProdNoDate.arrivalDate))
                .rejects
                .toBeInstanceOf(ProductNotFoundError);

            expect(mockDBGet).toHaveBeenCalled();
            expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [dbProdNoDate.model], expect.any(Function))
            expect(mockDBRun).not.toHaveBeenCalled();
        });

        test("ProductDAO_2.4: arrivalDate is after the current date (it should reject FutureDateError)", async () => {
            const productDAO = new ProductDAO();

            await expect(productDAO.changeProductQuantity(dbProdFutureDate.model, dbProdFutureDate.quantity, dbProdFutureDate.arrivalDate))
                .rejects
                .toThrow(FutureDateError);

            expect(mockDBGet).not.toHaveBeenCalled();
            expect(mockDBRun).not.toHaveBeenCalled();
        });

        test("ProductDAO_2.5: The provided arrivalDate is before the set of products' current arrivalDate (it should reject FutureDateError)", async () => {
            const productDAO = new ProductDAO();

            mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, dbProdOkDate);
            })

            await expect(productDAO.changeProductQuantity(dbProdPastDate.model, dbProdPastDate.quantity, dbProdPastDate.arrivalDate))
                .rejects
                .toThrow(FutureDateError);

            expect(mockDBGet).toHaveBeenCalled();
            expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [dbProdPastDate.model], expect.any(Function))
            expect(mockDBRun).not.toHaveBeenCalled();
        });

        test("ProductDAO_2.6: An SQL error occurs in the SQLite get method and it's passed to the callback (it should reject the error)", async () => {
            const productDAO = new ProductDAO();

            mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(new Error(), undefined);
            })

            try {
                await productDAO.changeProductQuantity(dbProdNoDate.model, dbProdNoDate.quantity, dbProdNoDate.arrivalDate);
            }
            catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(Object.getPrototypeOf(error)).toBe(Error.prototype);
            }

            expect(mockDBGet).toHaveBeenCalled();
            expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [dbProdNoDate.model], expect.any(Function))
            expect(mockDBRun).not.toHaveBeenCalled();
        });

        test("ProductDAO_2.7: An SQL error occurs in the SQLite run method and it's passed to the callback (it should reject the error)", async () => {
            const productDAO = new ProductDAO();

            mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, dbProdOkDate);
            })

            mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null)) => void) => {
                callback(new Error());
            })

            try {
                await productDAO.changeProductQuantity(dbProdNoDate.model, dbProdNoDate.quantity, dbProdNoDate.arrivalDate);
            }
            catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(Object.getPrototypeOf(error)).toBe(Error.prototype);
            }

            expect(mockDBGet).toHaveBeenCalled();
            expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [dbProdNoDate.model], expect.any(Function))
            expect(mockDBRun).toHaveBeenCalled();
            expect(mockDBRun).toHaveBeenCalledWith(expect.stringContaining("UPDATE"), expect.arrayContaining(
                    [dbProdNoDate.model, dbProdNoDate.quantity]),
                expect.any(Function));
        });

        test("ProductDAO_2.8: SQLite get method throws an Error (it should reject the error)", async () => {
            const productDAO = new ProductDAO();

            mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                throw new Error();
            })

            await expect(productDAO.changeProductQuantity(dbProdPastDate.model, dbProdPastDate.quantity, dbProdPastDate.arrivalDate))
                .rejects
                .toThrow(Error);

            expect(mockDBGet).toHaveBeenCalled();
            expect(mockDBGet).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [dbProdNoDate.model], expect.any(Function))
            expect(mockDBRun).not.toHaveBeenCalled();
        });
    });

    describe("ProductDAO_3: getProducts method tests", () => {
        let mockDBAll: any;

        beforeEach(async () => {
            mockDBAll = jest.spyOn(db, "all");
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test("ProductDAO_3.1: Get all products in the database, no grouping (it should resolve an Array of Product)", async () => {
            const productDAO = new ProductDAO();

            mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, [dbProd1, dbProd2, dbProd3]);
            })

            const result = await productDAO.getProducts(null, null, null);

            expect(result).toEqual([prod1, prod2, prod3]);
            expect(mockDBAll).toHaveBeenCalled();
            expect(mockDBAll).toHaveBeenCalledWith(expect.stringContaining("SELECT *"), [], expect.any(Function))
        });

        test("ProductDAO_3.2: Get all products in the database, category grouping (it should resolve an Array of Product)", async () => {
            const productDAO = new ProductDAO();

            mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, [dbProd2, dbProd3]);
            })

            const result = await productDAO.getProducts("category", Category.LAPTOP, null);

            expect(result).toEqual([prod2, prod3]);
            expect(mockDBAll).toHaveBeenCalled();
            expect(mockDBAll).toHaveBeenCalledWith(expect.stringContaining("'" + Category.LAPTOP + "'"), [], expect.any(Function))
        });

        test("ProductDAO_3.3: Get all products in the database, model grouping (it should resolve an Array of Product)", async () => {
            const productDAO = new ProductDAO();

            mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, [dbProd3]);
            })

            const result = await productDAO.getProducts("model", null, "Asus ROG Zephyrus G16");

            expect(result).toEqual([prod3]);
            expect(mockDBAll).toHaveBeenCalled();
            expect(mockDBAll).toHaveBeenCalledWith(expect.stringContaining("'" + "Asus ROG Zephyrus G16" + "'"), [], expect.any(Function))
        });

        test("ProductDAO_3.4: Illegal grouping, grouping == \"model\", category not null (it should reject an Error)", async () => {
            const productDAO = new ProductDAO();

            await expect(productDAO.getProducts("model", Category.LAPTOP, "Asus ROG Zephyrus G16")).rejects.toThrow(Error);

            expect(mockDBAll).not.toHaveBeenCalled();
        });

        test("ProductDAO_3.5: Illegal grouping, grouping == \"category\", model not null (it should reject an Error)", async () => {
            const productDAO = new ProductDAO();

            await expect(productDAO.getProducts("category", Category.LAPTOP, "Asus ROG Zephyrus G16")).rejects.toThrow(Error);

            expect(mockDBAll).not.toHaveBeenCalled();
        });

        test("ProductDAO_3.6: Illegal grouping, grouping == \"model\", model is null (it should reject an Error)", async () => {
            const productDAO = new ProductDAO();

            await expect(productDAO.getProducts("model", null, null)).rejects.toThrow(Error);

            expect(mockDBAll).not.toHaveBeenCalled();
        });

        test("ProductDAO_3.7: Illegal grouping, grouping == \"category\", category is null (it should reject an Error)", async () => {
            const productDAO = new ProductDAO();

            await expect(productDAO.getProducts("model", null, null)).rejects.toThrow(Error);

            expect(mockDBAll).not.toHaveBeenCalled();
        });

        test("ProductDAO_3.8: Illegal grouping, grouping == unknown string (it should reject an Error)", async () => {
            const productDAO = new ProductDAO();

            await expect(productDAO.getProducts("iphone", null, null)).rejects.toThrow(Error);

            expect(mockDBAll).not.toHaveBeenCalled();
        });

        test("ProductDAO_3.9: Model grouping, but model does not represent a product in the DB (it should reject ProductNotFoundError)", async () => {
            const productDAO = new ProductDAO();

            mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(null, []);
            })

            await expect(productDAO.getProducts("model", null, "iPhone X"))
                .rejects
                .toThrow(ProductNotFoundError);

            expect(mockDBAll).toHaveBeenCalled();
            expect(mockDBAll).toHaveBeenCalledWith(expect.stringContaining("'" + "iPhone X" + "'"), [], expect.any(Function))
        });

        test("ProductDAO_3.10: An SQL error occurs in the SQLite all method and it's passed to the callback (it should reject the error)", async () => {
            const productDAO = new ProductDAO();

            mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                callback(new Error(), undefined);
            })

            await expect(productDAO.getProducts(null, null, null))
                .rejects
                .toThrow(Error);

            expect(mockDBAll).toHaveBeenCalled();
            expect(mockDBAll).toHaveBeenCalledWith(expect.stringContaining("SELECT *"), [], expect.any(Function))
        });

        test("ProductDAO_3.11: SQLite all method throws an Error (it should reject the error)", async () => {
            const productDAO = new ProductDAO();

            mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: (Error | null), row: any) => void) => {
                throw new Error();
            })

            await expect(productDAO.getProducts(null, null, null))
                .rejects
                .toThrow(Error);

            expect(mockDBAll).toHaveBeenCalled();
            expect(mockDBAll).toHaveBeenCalledWith(expect.stringContaining("SELECT *"), [], expect.any(Function))
        });
    });
});