import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import ProductController from "../../src/controllers/productController"
import Authenticator from "../../src/routers/auth"
import {Product, Category} from "../../src/components/product"
import ErrorHandler from "../../src/helper"


const baseURL = "/ezelectronics"

jest.mock("../../src/controllers/productController")
jest.mock("../../src/routers/auth")



/*jest.mock('express-validator', () => ({
    body: jest.fn().mockImplementation(() => ({
        isString: () => ({ isLength: () => ({}) }),
        isIn: () => ({ isLength: () => ({}) }),
    })),
}));*/

describe("Products routes unit tests", () =>{
    describe("POST /products", ()=>{
        //Test per la route che crea un prodotto

        test("It should return a 200 success code", async ()=>{
            const  inputProduct = {
                model: "model",
                category: "category",
                quantity: 3,
                details: "aa",
                sellingPrice: 15,
                arrivalDate: "2022/12/12"
            };

            const testController=jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValue();
            const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
                return next()
            })
            const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
                return next()
            })

            const response = await request(app).post(baseURL + "/products").send(inputProduct);
            expect(response.status).toBe(200);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(inputProduct.model, inputProduct.category, inputProduct.quantity, inputProduct.details, inputProduct.sellingPrice, inputProduct.arrivalDate);
        
            testController.mockRestore();
            testLogin.mockRestore();
            testManager.mockRestore();
        
        });
    });

    describe("PATCH /products/:model", ()=>{
        test("It should return a 200 success code", async ()=>{
            const model = "testModel";
            const requestBody = {
                quantity: 5,
                changeDate: "2022-12-12"
            };

            const testController=jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValue(10);
            const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
                return next()
            })
            const testManager=jest.spyOn(Authenticator.prototype, "isManager").mockImplementation((req,res,next)=>{
                return next()
            })
            const response = await request(app).patch(baseURL + "/products/testModel").send(requestBody);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ quantity: 10} );
            expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(model, requestBody.quantity, requestBody.changeDate);


            testController.mockRestore();
            testLogin.mockRestore();
            testManager.mockRestore();

    });
});



});
