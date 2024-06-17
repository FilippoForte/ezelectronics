import { test, expect, jest, afterEach, describe } from "@jest/globals";
import ProductController from "../../src/controllers/productController";
import ProductDAO from "../../src/dao/productDAO";
import { Role, User } from "../../src/components/user";
import {Product,Category} from "../../src/components/product";



jest.mock("../../src/dao/productDAO");


describe("Products controller unit tests", () =>{
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    describe ("ProductController_1: registerProducts method tests", () => {
        test("ProductController_1.1: Correct registration of a set of products. It should return nothing", async () => {
            const testProduct = {
                model: "test",
                category : Category.SMARTPHONE,
                quantity: 5,
                details: "aaa",
                sellingPrice: 50,
                arrivalDate: ""
            }
            jest.spyOn(ProductDAO.prototype, "registerProducts").mockResolvedValue();
            const controller = new ProductController();

            const response = await controller.registerProducts(testProduct.model, testProduct.category, testProduct.quantity, testProduct.details, testProduct.sellingPrice, testProduct.arrivalDate);
            expect(ProductDAO.prototype.registerProducts).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.registerProducts).toHaveBeenCalledWith(testProduct.model, testProduct.category, testProduct.quantity, testProduct.details, testProduct.sellingPrice, testProduct.arrivalDate);
            expect(response).toBe(undefined);
        });
});

    describe("ProductController_2: changeProductQuantity method tests", () => {
        test("ProductController_2.1: Correct change of a product quantity. It should return nothing", async () => {
            const testProduct = {
                model: "test",
                newQuantity: 5,
                changeDate: ""
            }
            jest.spyOn(ProductDAO.prototype, "changeProductQuantity").mockResolvedValue(8);
            const controller = new ProductController();

            const respose = await controller.changeProductQuantity(testProduct.model, testProduct.newQuantity, testProduct.changeDate);
            expect(ProductDAO.prototype.changeProductQuantity).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.changeProductQuantity).toHaveBeenCalledWith(testProduct.model, testProduct.newQuantity, testProduct.changeDate);
            expect(respose).toBe(8);
            
    });
});
    describe("ProductController_3: sellProduct method tests", () => {
        test("ProductController_3.1: Correct selling of a product. It should return nothing", async () => {
            const testProduct = {
                model: "test",
                quantity: 5,
                sellingDate: "2023/11/11"   
            }
            jest.spyOn(ProductDAO.prototype, "sellProduct").mockResolvedValue(8);
            const controller = new ProductController();

            const respose = await controller.sellProduct(testProduct.model, testProduct.quantity, testProduct.sellingDate);
            expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledWith(testProduct.model, testProduct.quantity, testProduct.sellingDate);
            expect(respose).toBe(8);
            
    });
});

    describe("ProductController_4: getProducts method tests", () => {
        test("ProductController_4.1: Correct retrieval of products. It should return an array of products", async () => {
            const testProduct1 = {
                model: "test",
                category : Category.APPLIANCE,
                quantity: 5,
                details: "aaa",
                sellingPrice: 50,
                arrivalDate: ""
            }
            const testProduct2 = {
                model: "test",
                category : Category.LAPTOP,
                quantity: 5,
                details: "aaa",
                sellingPrice: 50,
                arrivalDate: ""
            }
            jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValue([testProduct1, testProduct2]);
            const controller = new ProductController();

            const respose = await controller.getProducts("","","");
            expect(ProductDAO.prototype.getProducts).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProducts).toHaveBeenCalledWith("","","");
            expect(respose).toStrictEqual([testProduct1, testProduct2]);
                
        });
});

    describe("ProductController_5: getAvailableProducts method tests", () => {
        test("ProductController_5.1: Correct retrieval of available products. It should return an array of products", async () => {
            const testProduct1 = {
                model: "test",
                category : Category.APPLIANCE,
                quantity: 5,
                details: "aaa",
                sellingPrice: 50,
                arrivalDate: ""
            }
            const testProduct2 = {
                model: "test",
                category : Category.LAPTOP,
                quantity: 5,
                details: "aaa",
                sellingPrice: 50,
                arrivalDate: ""
            }
            jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValue([testProduct1, testProduct2]);
            const controller = new ProductController(); 

            const respose = await controller.getAvailableProducts("","","");
            expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledWith("","","");
            expect(respose).toStrictEqual([testProduct1, testProduct2]);
        });
    });

    describe("ProductController_6: deleteProduct method tests", ()=> {

        test("ProductController_6.1: Correct deletion of a product. It should return nothing", async () => {
            const testProduct = {
                model: "test",
                category : Category.APPLIANCE,
                quantity: 5,
                details: "aaa",
                sellingPrice: 50,
                arrivalDate: ""
            }
            jest.spyOn(ProductDAO.prototype, "deleteProduct").mockResolvedValue(true);
            const controller = new ProductController();
            
            const response = await controller.deleteProduct(testProduct.model);
            expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledWith(testProduct.model);
            expect(response).toBe(true);
        });
    });

    describe("ProductController_7: deleteAllProducts method tests", ()=> {
        test("ProductController_7.1: Correct deletion of all products. It should return nothing", async () => {
            jest.spyOn(ProductDAO.prototype, "deleteAllProducts").mockResolvedValue(true);
            const controller = new ProductController();
            
            const response = await controller.deleteAllProducts();
            expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalled();
            expect(response).toBe(true);
        });
        })

});
