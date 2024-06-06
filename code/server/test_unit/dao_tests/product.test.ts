import {expect, jest, test} from "@jest/globals";
import db from "../../src/db/db";
import CartDAO from "../../src/dao/cartDAO";
import {Category} from "../../src/components/product";
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

    describe("ProductDAO_2: changeProductQuantity", () => {
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
                    [dbProdNoDate.model, dbProdNoDate.quantity, dayjs().format("YYYY-MM-DD")]),
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
                    [dbProdNewDate.model, dbProdNewDate.quantity, dbProdNewDate.arrivalDate]),
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

            await expect(productDAO.changeProductQuantity(dbProdPastDate.model, dbProdPastDate.quantity, dbProdPastDate.arrivalDate))
                .rejects
                .toThrow(FutureDateError);

            expect(mockDBGet).not.toHaveBeenCalled();
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
                    [dbProdNoDate.model, dbProdNoDate.quantity, dayjs().format("YYYY-MM-DD")]),
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
});