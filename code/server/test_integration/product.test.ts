import { test, expect, jest } from "@jest/globals";
import db from "../src/db/db";
import ProductController from "../src/controllers/productController";
import ProductDAO from "../src/dao/productDAO";
import { Role, User } from "../src/components/user";
import {Product,Category} from "../src/components/product";
import {cleanupAsync, cleanup} from "../src/db/cleanup";
import {FutureDateError, ProductAlreadyExistsError, ProductNotFoundError} from "../src/errors/productError";

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
    quantity: 0
}

function dbSetup(): void {
    db.serialize(() => {
        let insertion = db.prepare("INSERT INTO products(category, model, sellingPrice, arrivalDate, details, quantity) VALUES(?, ?, ?, ?, ?, ?)");
        insertion.finalize();
    });
}

cleanup();
dbSetup();


describe("Products controller and dao integration tests", () => {
    let controller: any;

    beforeAll(async () => {
        controller = new ProductController();
    });

    afterEach(async () => {
        await cleanupAsync();
    });

    describe("ProductIntegration_1: registerProducts method tests", () => {
        test("ProductIntegration_1.1: Correct registration of a set of products (it should resolve void)", async () => {
            const response = await controller.registerProducts(dbProdOkDate.model, dbProdOkDate.category, dbProdOkDate.quantity, dbProdOkDate.details, dbProdOkDate.sellingPrice, dbProdOkDate.arrivalDate);
            expect(response).toBe(undefined);

            db.get("SELECT * FROM products WHERE model = ?", [dbProdOkDate.model], (err: Error | null, row: any) => {
               expect(row).toEqual(dbProdOkDate);
            });
        });

        test("ProductIntegration_1.2: Try to register an already existing set of products (it should reject ProductAlreadyExistsError", async () => {
            const response = await controller.registerProducts(dbProdOkDate.model, dbProdOkDate.category, dbProdOkDate.quantity, dbProdOkDate.details, dbProdOkDate.sellingPrice, dbProdOkDate.arrivalDate);

            expect(response).toBe(undefined);

            await expect(controller.registerProducts(dbProdOkDate.model, dbProdOkDate.category, dbProdOkDate.quantity, dbProdOkDate.details, dbProdOkDate.sellingPrice, dbProdOkDate.arrivalDate))
                .rejects
                .toThrow(ProductAlreadyExistsError);

            db.get("SELECT * FROM products WHERE model = ?", [dbProdOkDate.model], (err: Error | null, row: any) => {
                expect(row).toEqual(dbProdOkDate);
            });
        });

        test("ProductIntegration_1.3: arrivalDate is after the current date (it should reject FutureDateError)", async () => {
            await expect(controller.registerProducts(dbProdFutureDate.model, dbProdFutureDate.category, dbProdFutureDate.quantity, dbProdFutureDate.details, dbProdFutureDate.sellingPrice, dbProdFutureDate.arrivalDate))
                .rejects
                .toThrow(FutureDateError);
        });
    });
});
//
//     describe("ProductController_2: changeProductQuantity method tests", () => {
//         test("ProductController_2.1: Correct change of a product quantity. It should return nothing", async () => {
//             const testProduct = {
//                 model: "test",
//                 newQuantity: 5,
//                 changeDate: ""
//             }
//             jest.spyOn(ProductDAO.prototype, "changeProductQuantity").mockResolvedValue(8);
//             const controller = new ProductController();
//
//             const respose = await controller.changeProductQuantity(testProduct.model, testProduct.newQuantity, testProduct.changeDate);
//             expect(ProductDAO.prototype.changeProductQuantity).toHaveBeenCalledTimes(1);
//             expect(ProductDAO.prototype.changeProductQuantity).toHaveBeenCalledWith(testProduct.model, testProduct.newQuantity, testProduct.changeDate);
//             expect(respose).toBe(8);
//
//         });
//     });
//     describe("ProductController_3: sellProduct method tests", () => {
//         test("ProductController_3.1: Correct selling of a product. It should return nothing", async () => {
//             const testProduct = {
//                 model: "test",
//                 quantity: 5,
//                 sellingDate: "2023/11/11"
//             }
//             jest.spyOn(ProductDAO.prototype, "sellProduct").mockResolvedValue(8);
//             const controller = new ProductController();
//
//             const respose = await controller.sellProduct(testProduct.model, testProduct.quantity, testProduct.sellingDate);
//             expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledTimes(1);
//             expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledWith(testProduct.model, testProduct.quantity, testProduct.sellingDate);
//             expect(respose).toBe(8);
//
//         });
//     });
//
//     describe("ProductController_4: getProducts method tests", () => {
//         test("ProductController_4.1: Correct retrieval of products. It should return an array of products", async () => {
//             const testProduct1 = {
//                 model: "test",
//                 category : Category.APPLIANCE,
//                 quantity: 5,
//                 details: "aaa",
//                 sellingPrice: 50,
//                 arrivalDate: ""
//             }
//             const testProduct2 = {
//                 model: "test",
//                 category : Category.LAPTOP,
//                 quantity: 5,
//                 details: "aaa",
//                 sellingPrice: 50,
//                 arrivalDate: ""
//             }
//             jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValue([testProduct1, testProduct2]);
//             const controller = new ProductController();
//
//             const respose = await controller.getProducts("","","");
//             expect(ProductDAO.prototype.getProducts).toHaveBeenCalledTimes(1);
//             expect(ProductDAO.prototype.getProducts).toHaveBeenCalledWith("","","");
//             expect(respose).toStrictEqual([testProduct1, testProduct2]);
//
//         });
//     });
//
//     describe("ProductController_5: getAvailableProducts method tests", () => {
//         test("ProductController_5.1: Correct retrieval of available products. It should return an array of products", async () => {
//             const testProduct1 = {
//                 model: "test",
//                 category : Category.APPLIANCE,
//                 quantity: 5,
//                 details: "aaa",
//                 sellingPrice: 50,
//                 arrivalDate: ""
//             }
//             const testProduct2 = {
//                 model: "test",
//                 category : Category.LAPTOP,
//                 quantity: 5,
//                 details: "aaa",
//                 sellingPrice: 50,
//                 arrivalDate: ""
//             }
//             jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValue([testProduct1, testProduct2]);
//             const controller = new ProductController();
//
//             const respose = await controller.getAvailableProducts("","","");
//             expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledTimes(1);
//             expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledWith("","","");
//             expect(respose).toStrictEqual([testProduct1, testProduct2]);
//         });
//     });
//
//     describe("ProductController_6: deleteProduct method tests", ()=> {
//
//         test("ProductController_6.1: Correct deletion of a product. It should return nothing", async () => {
//             const testProduct = {
//                 model: "test",
//                 category : Category.APPLIANCE,
//                 quantity: 5,
//                 details: "aaa",
//                 sellingPrice: 50,
//                 arrivalDate: ""
//             }
//             jest.spyOn(ProductDAO.prototype, "deleteProduct").mockResolvedValue(true);
//             const controller = new ProductController();
//
//             const response = await controller.deleteProduct(testProduct.model);
//             expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledTimes(1);
//             expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledWith(testProduct.model);
//             expect(response).toBe(true);
//         });
//     });
//
//     describe("ProductController_7: deleteAllProducts method tests", ()=> {
//         test("ProductController_7.1: Correct deletion of all products. It should return nothing", async () => {
//             jest.spyOn(ProductDAO.prototype, "deleteAllProducts").mockResolvedValue(true);
//             const controller = new ProductController();
//
//             const response = await controller.deleteAllProducts();
//             expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalledTimes(1);
//             expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalled();
//             expect(response).toBe(true);
//         });
//     })
//
// });
