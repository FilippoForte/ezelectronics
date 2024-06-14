import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import ProductController from "../../src/controllers/productController"
import Authenticator from "../../src/routers/auth"
import {Product, Category} from "../../src/components/product"
import ErrorHandler from "../../src/helper"
import { FutureDateError, LowProductStockError, ProductAlreadyExistsError, ProductNotFoundError } from "../../src/errors/productError"
import ProductRoutes from "../../src/routers/productRoutes"


const baseURL = "/ezelectronics"

jest.mock("../../src/controllers/productController")
jest.mock("../../src/routers/auth")

let testProductSmartphone = new Product(100 ,"model", Category.SMARTPHONE, "2022/12/12", "aa", 15);
let testProductLaptop = new Product(500 ,"model", Category.LAPTOP, "2022/12/22", "aa", 5);
/*jest.mock('express-validator', () => ({
    body: jest.fn().mockImplementation(() => ({
        isString: () => ({ isLength: () => ({}) }),
        isIn: () => ({ isLength: () => ({}) }),
    })),
}));*/

describe("Products routes unit tests", () =>{
    describe("Routes_1:POST /products", ()=>{
        //Test per la route che crea un prodotto
        test("Routes_1.1:Correct registration of a set of products.It should return a 200 success code", async ()=>{
            const  inputProduct = {
                model: "model",
                category: "Smartphone",
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

            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isIn: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
           
            const response = await request(app).post(baseURL + "/products").send(inputProduct);
            expect(response.status).toBe(200);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(inputProduct.model, inputProduct.category, inputProduct.quantity, inputProduct.details, inputProduct.sellingPrice, inputProduct.arrivalDate);
            
            testController.mockRestore();
            testLogin.mockRestore();
            testManager.mockRestore();
        
        });

        test("Routes_1.2:Insertion of an already existing set of products. It should return a 409 error", async ()=>{
            const  inputProduct = {
                model: "model",
                category: "Smartphone",
                quantity: 3,
                details: "aa",
                sellingPrice: 15,
                arrivalDate: "2022/12/12"
            };

            const testController=jest.spyOn(ProductController.prototype, "registerProducts").mockRejectedValue(new ProductAlreadyExistsError());
            const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
                return next()
            })
            const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
                return next()
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isIn: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            const response = await request(app).post(baseURL + "/products").send(inputProduct);
            expect(response.status).toBe(409);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(inputProduct.model, inputProduct.category, inputProduct.quantity, inputProduct.details, inputProduct.sellingPrice, inputProduct.arrivalDate);
        
            testController.mockRestore();
            testLogin.mockRestore();
            testManager.mockRestore();
        
        });
        
        test("Routes_1.3:Insertion of an arrivalDate after the current date. It should return a 400 error", async ()=>{
            const  inputProduct = {
                model: "model",
                category: "Smartphone",
                quantity: 3,
                details: "aa",
                sellingPrice: 15,
                arrivalDate: "2028/12/12"
            };

            const testController=jest.spyOn(ProductController.prototype, "registerProducts").mockRejectedValue(new FutureDateError());
            const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
                return next()
            })
            const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
                return next()
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isInt:()=>({  }),
                    isFloat: ()=>({  }),
                    isIn: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            const response = await request(app).post(baseURL + "/products").send(inputProduct);
            expect(response.status).toBe(400);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(inputProduct.model, inputProduct.category, inputProduct.quantity, inputProduct.details, inputProduct.sellingPrice, inputProduct.arrivalDate);
        
            testController.mockRestore();
            testLogin.mockRestore();
            testManager.mockRestore();
        
        });
        //test model vuoto
        //test category non valida
        //test quantity non valida
        //test sellingPrice non valido 
        //test arrivalDate formato errato
        //TEST ERRORE GENERICO DAL DAO 
        test("Routes_1.4: User is not logged in. It should return a 401 error", async ()=>{
            const  inputProduct = {
                model: "model",
                category: "category",
                quantity: 3,
                details: "aa",
                sellingPrice: 15,
                arrivalDate: "2022/12/12"
            };

            const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
                return res.status(401).json({error: "Unauthenticated user"})
            })
            const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
                return res.status(401).json({error: "Unauthenticated user"})
            })

            const response = await request(app).post(baseURL + "/products").send(inputProduct);
            expect(response.status).toBe(401);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);


            testLogin.mockRestore();
            testManager.mockRestore();
        
        });
        test("Routes_1.4: User is not Admin or Manager. It should return a 401 error", async ()=>{
            const  inputProduct = {
                model: "model",
                category: "category",
                quantity: 3,
                details: "aa",
                sellingPrice: 15,
                arrivalDate: "2022/12/12"
            };

            const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
                return next()
            })  
            const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
                return res.status(401).json({error: "User is not an admin or manager"})
            })

            const response = await request(app).post(baseURL + "/products").send(inputProduct);
            expect(response.status).toBe(401);
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);

            testLogin.mockRestore();
            testManager.mockRestore();
        
        });

});

    describe("Routes_2:PATCH /products/:model", ()=>{
        test("Routes_2.1: Correct changes in product quantity.It should return a 200 success code", async ()=>{
            const model = "testModel";
            const requestBody = {
                quantity: 5,
                changeDate: "2022-12-12"
            };

            const testController=jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValue(10);
            const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
                return next()
            })
            const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
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
    test("Routes_2.2: User is not logged in. It should return a 401 error", async ()=>{
        const model = "testModel";
        const requestBody = {
            quantity: 5,
            changeDate: "2022-12-12"
        };

        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return res.status(401).json({error: "Unauthenticated user"})
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return res.status(401).json({error: "User is not a manager"})
        })

        const response = await request(app).patch(baseURL + "/products/" + model).send(requestBody);
        expect(response.status).toBe(401);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(0);


        testLogin.mockRestore();
        testManager.mockRestore();
    
    });
    test("Routes_2.3: User is not Admin or Manager. It should return a 401 error", async ()=>{
        const model = "testModel";
        const requestBody = {
            quantity: 5,
            changeDate: "2022-12-12"
        };

        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next()
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return res.status(401).json({error: "User is not a manager"})
        })

        const response = await request(app).patch(baseURL + "/products/" + model).send(requestBody);
        expect(response.status).toBe(401);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(0);

        testLogin.mockRestore();
        testManager.mockRestore();
    
    });
    //test model empty
    //test quantity not valid
    //test changeDate not valid
    //errore generico sql
    test('Routes_2.4: Model not found. It should return a 404 error', async ()=>{
        const model = "testModel";
        const requestBody = {
            quantity: 5,
            changeDate: "2022-12-12"
        };
        const testController=jest.spyOn(ProductController.prototype, "changeProductQuantity").mockRejectedValue(new ProductNotFoundError());
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next()
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return next()
        })
        const response = await request(app).patch(baseURL + "/products/" + model).send(requestBody);
        expect(response.status).toBe(404);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(model, requestBody.quantity, requestBody.changeDate);


        testController.mockRestore();
        testLogin.mockRestore();
        testManager.mockRestore();
    });
    test('Routes_2.5: Change Date after current date. It should return a 400 error', async ()=>{
        const model = "testModel";
        const requestBody = {
            quantity: 5,
            changeDate: "2028-12-12"
        };
        const testController=jest.spyOn(ProductController.prototype, "changeProductQuantity").mockRejectedValue(new FutureDateError());
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next()
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return next()
        })
        const response = await (request(app).patch(baseURL + "/products/" + model).send(requestBody));
        expect(response.status).toBe(400);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(model, requestBody.quantity, requestBody.changeDate);

        testController.mockRestore();
        testLogin.mockRestore();
        testManager.mockRestore();
    });
    test('Routes_2.6: Change Date before arrival date. It should return a 400 error', async ()=>{
        const model = "testModel";
        const requestBody = {
            quantity: 5,
            changeDate: "2020-12-12"
        };
        const testController=jest.spyOn(ProductController.prototype, "changeProductQuantity").mockRejectedValue(new FutureDateError());
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next()
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return next()
        })
        const response = await (request(app).patch(baseURL + "/products/" + model).send(requestBody));
        expect(response.status).toBe(400);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(model, requestBody.quantity, requestBody.changeDate);

        testController.mockRestore();
        testLogin.mockRestore();
        testManager.mockRestore();
    });
});

describe("Routes_3:PATCH /products/:model/sell", ()=>{
    test("Routes_3.1: Correct selling of products.It should return a 200 success code", async ()=>{
        const model = "testModel";
        const requestBody = {          
            sellingDate: "2022-12-12",
            quantity: 11
        };

        const testController=jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValue(10);
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next()
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return next()
        })
        const response = await request(app).patch(baseURL + "/products/testModel/sell").send(requestBody);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ quantity: 10} );
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(model, requestBody.quantity, requestBody.sellingDate);


        testController.mockRestore();
        testLogin.mockRestore();
        testManager.mockRestore();
    });
    //test model empty
    // selling date not valid
    //test quantity not valid
    //errore generico sql
    test('Routes_3.2: Model not found. It should return a 404 error', async ()=>{
        const model = "testModel";
        const requestBody = {
            quantity: 11,        
            sellingDate: "2022-12-12"
            
        };
        const testController=jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValue(new ProductNotFoundError());
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next()
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return next()
        })
        const response = await request(app).patch(baseURL + "/products/" + model + "/sell").send(requestBody);
        expect(response.status).toBe(404);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(model, requestBody.quantity, requestBody.sellingDate);

        testController.mockRestore();
        testLogin.mockRestore();
        testManager.mockRestore();
    });
    test('Routes_3.3: Selling Date after current date. It should return a 400 error', async ()=>{
        const model = "testModel";
        const requestBody = {
            quantity: 11,        
            sellingDate: "2028-12-12"
            
        };
        const testController=jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValue(new FutureDateError());
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next()
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return next()
        })
        
        const response = (await (request(app).patch(baseURL + "/products/" + model + "/sell").send(requestBody)));
        expect(response.status).toBe(400);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(model, requestBody.quantity, requestBody.sellingDate);

        testController.mockRestore();
        testLogin.mockRestore();
        testManager.mockRestore();
    });
    test('Routes_3.4: Selling date before arrival date. It should return a 400 error', async ()=>{
        const model = "testModel";
        const requestBody = {
            quantity: 11,        
            sellingDate: "2020-12-12"
            
        };
        const testController=jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValue(new FutureDateError());
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next()
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return next()
        })
        const response = (await (request(app).patch(baseURL + "/products/" + model + "/sell").send(requestBody)));
        expect(response.status).toBe(400);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(model, requestBody.quantity, requestBody.sellingDate);
        
        testController.mockRestore();  
        testLogin.mockRestore();
        testManager.mockRestore();
    });
    test('Routes_3.5: Quantity available is 0. It should return a 409 error', async ()=>{
        const model = "testModel";
        const requestBody = {
            quantity: 2,        
            sellingDate: "2022-12-12"
            
        };
        const testController=jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValue(new LowProductStockError());
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next()
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return next()
        })
        const response = (await (request(app).patch(baseURL + "/products/" + model + "/sell").send(requestBody)));
        expect(response.status).toBe(409);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(model, requestBody.quantity, requestBody.sellingDate);

        testController.mockRestore();
        testLogin.mockRestore();
        testManager.mockRestore();
    });
    test('Routes_3.6: Quantity in the request higher than quantity available. It should return a 409 error', async ()=>{
        const model = "testModel";
        const requestBody = {
            quantity: 11,        
            sellingDate: "2022-12-12"
            
        };
        const testController=jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValue(new LowProductStockError());
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next()
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return next()
        })
        const response = (await (request(app).patch(baseURL + "/products/" + model + "/sell").send(requestBody)));
        expect(response.status).toBe(409);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(model, requestBody.quantity, requestBody.sellingDate);
        
        testController.mockRestore();
        testLogin.mockRestore();
        testManager.mockRestore();
    });
    test('Routes_3.7: User is not logged in. It should return a 401 error', async ()=>{
        const model = "testModel";
        const requestBody = {
            quantity: 11,        
            sellingDate: "2022-12-12"
            
        };
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return res.status(401).json({error:"Unauthenticated user"})
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return res.status(401).json({error:"Unauthenticated user"})
        })
        const response = (await (request(app).patch(baseURL + "/products/" + model + "/sell").send(requestBody)));
        expect(response.status).toBe(401);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(0);

        testLogin.mockRestore();
        testManager.mockRestore();

    });
    test('Routes_3.8: User is not a manager. It should return a 401 error', async ()=>{
        const model = "testModel";
        const requestBody = {
            quantity: 11,        
            sellingDate: "2022-12-12"
            
        };
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next()
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return res.status(401).json({error:"User is not a manager"})
        })
        const response = (await (request(app).patch(baseURL + "/products/" + model + "/sell").send(requestBody)));
        expect(response.status).toBe(401);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(0);

        testLogin.mockRestore();
        testManager.mockRestore();

    })
});

describe("Routes_4: GET /products", ()=>{
    test("Routes_4.1: Correct return of  products.It should return a 200 success code", async ()=>{
        const testController=jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValue([testProductSmartphone,testProductLaptop]);
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next()
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return next()
        })
        const testGrouping=jest.spyOn(ProductRoutes.prototype, "groupingOk").mockImplementation((req,res,next)=>{
            
            return next()
        })
        const response = (await request(app).get(baseURL + "/products?grouping=&category=&model="));
        expect(response.status).toBe(200);
        expect(response.body).toEqual([testProductSmartphone,testProductLaptop]);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledWith("", "", "");
        testController.mockRestore();
        testLogin.mockRestore();
        testManager.mockRestore();
        testGrouping.mockRestore();
    });
    //correct con category?
    //correct con model?
    test("Routes_4.2: User not logged in. It should return a 401 error", async ()=>{
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return res.status(401).json({error: "Unauthenticated user"})
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return res.status(401).json({error:"User is not an admin or manager"})
        })
        const testGrouping=jest.spyOn(ProductRoutes.prototype, "groupingOk").mockImplementation((req,res,next)=>{
            
            return next()
        })
        const response = (await request(app).get(baseURL + "/products?grouping=&category=&model="));
        expect(response.status).toBe(401);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(0);
        
        testLogin.mockRestore();
        testManager.mockRestore();
        testGrouping.mockRestore();
    });
    test("Routes_4.3: User not an admin or manager. It should return a 401 error", async ()=>{
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next()
        })
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return res.status(401).json({error:"User is not an admin or manager"})
        })
        const testGrouping=jest.spyOn(ProductRoutes.prototype, "groupingOk").mockImplementation((req,res,next)=>{
            
            return next()
        })
        const response = (await request(app).get(baseURL + "/products?grouping=&category=&model="));
        expect(response.status).toBe(401);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(0);
        
        testLogin.mockRestore();
        testManager.mockRestore();
        testGrouping.mockRestore();
    });
    //se model c'è non può essere empty
    test("Routes_4.4: Model does not represent a product in db. It should return a 404 error", async ()=>{
        const grouping ="model"
        const model="notAModel"
        const testController=jest.spyOn(ProductController.prototype, "getProducts").mockRejectedValue(new ProductNotFoundError());
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next()
        });
        const testManager=jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req,res,next)=>{
            return next()
        });
        const testGrouping=jest.spyOn(ProductRoutes.prototype, "groupingOk").mockImplementation((req,res,next)=>{
            
            return next()
        })
        const response = (await request(app).get(baseURL + "/products?grouping=" + grouping + "&category=&model=" + model ));
        expect(response.status).toBe(404);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledWith(grouping, "", model);

        testController.mockRestore();
        testLogin.mockRestore();
        testManager.mockRestore();
        testGrouping.mockRestore();
    });
    //test error 422 per grouping non corretti
});
describe('Routes_5: GET /products/available', () => {
    test('Routes_5.1: Correct return of  products available.It should return a 200 success code', async () => {
        const testController = jest.spyOn(ProductController.prototype, 'getAvailableProducts').mockResolvedValue([testProductSmartphone, testProductLaptop]);
        const testLogin = jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => {
            return next();
        });
        const testCustomer = jest.spyOn(Authenticator.prototype, 'isCustomer').mockImplementation((req, res, next) => {
            return next();
        });
        const testGrouping=jest.spyOn(ProductRoutes.prototype, "groupingOk").mockImplementation((req,res,next)=>{
            
            return next()
        })
        const response = (await request(app).get(baseURL + '/products/available?grouping=&category=&model='));
        expect(response.status).toBe(200);
        expect(response.body).toEqual([testProductSmartphone, testProductLaptop]);
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith("", "", "");



        testController.mockRestore();
        testLogin.mockRestore();
        testCustomer.mockRestore();
        testGrouping.mockRestore();
    
    });
    //CORRECT CON CATEGORY?
    //CORRECT CON MODEL?
    test("Routes_5.2: User not logged in. It should return a 401 error", async ()=>{

        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return res.status(401).json({error: "Unauthenticated user"})
        })
        const response = (await request(app).get(baseURL + "/products/available?grouping=&category=&model="));

        expect(response.status).toBe(401);
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(0);

        testLogin.mockRestore();
    });
    //test error 422 per grouping errati
    test("Routes_5.3: Model does not represent a product available in db. It should return a 404 error", async ()=>{
        const grouping ="model"
        const model="notAModel"
        const testController=jest.spyOn(ProductController.prototype, "getAvailableProducts").mockRejectedValue(new ProductNotFoundError());
        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next();
        });
        const testCustomer = jest.spyOn(Authenticator.prototype, 'isCustomer').mockImplementation((req, res, next) => {
            return next();
        })
        const response = (await request(app).get(baseURL + "/products/available?grouping=" + grouping + "&category=&model=" + model ));
        expect(response.status).toBe(404);
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith(grouping, "", model);

        testController.mockRestore();
        testLogin.mockRestore();
        testCustomer.mockRestore();
    });
    test("Routes_5.4: User not customer. It should return a 401 error", async ()=>{

        const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
            return next();
        });
        const testCustomer=jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req,res,next)=>{
            return res.status(401).json({error: "User is not a customer"});
        });
        const testGrouping=jest.spyOn(ProductRoutes.prototype, "groupingOk").mockImplementation((req,res,next)=>{
            
            return next()
        })
        const response = (await request(app).get(baseURL + "/products/available?grouping=&category=&model="));
        expect(response.status).toBe(401);
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(0);

        testLogin.mockRestore();  
        testCustomer.mockRestore();  
        testGrouping.mockRestore();
    });


});

  describe('Routes_6: DELETE /products/:model', () => {
    test('Routes_6.1: Delete a product correctly.It should return a 200 success code', async () => {
      const testController = jest.spyOn(ProductController.prototype, 'deleteProduct').mockResolvedValue(true);
      const testLogin = jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => {
        return next();
      });
      const testAdminOrManager = jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => {
        return next();
      });

      const response= (await request(app).delete(baseURL + '/products/testModel'));
      expect(response.status).toBe(200);
      expect(ProductController.prototype.deleteProduct).toHaveBeenCalledTimes(1);
      expect(ProductController.prototype.deleteProduct).toHaveBeenCalledWith('testModel');

      testController.mockRestore();
      testLogin.mockRestore();
      testAdminOrManager.mockRestore();
      });
    //test model empty
    test('Routes_6.2: Model does not represent a product in db. It should return a 404 error', async () => {
      const model= "notAModel"
      const testController = jest.spyOn(ProductController.prototype, 'deleteProduct').mockRejectedValue(new ProductNotFoundError());
      const testLogin = jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => {
        return next();
      });
      const testAdminOrManager = jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => {
        return next();
      });
      const response= (await request(app).delete(baseURL + '/products/' + model));
      expect(response.status).toBe(404);
      expect(ProductController.prototype.deleteProduct).toHaveBeenCalledTimes(1);
      expect(ProductController.prototype.deleteProduct).toHaveBeenCalledWith(model);

      testLogin.mockRestore();
      testController.mockRestore();
      testAdminOrManager.mockRestore();
    });
    test("Routes_6.3: User not logged in. It should return a 401 error", async ()=>{
      const model= "testModel"
      const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
          return res.status(401).json({error: "Unauthenticated user"})
      })
      const testAdminOrManager = jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => {
        return res.status(401).json({error: "User is not an admin or manager"});
      });
      const response = (await request(app).delete(baseURL + "/products/" + model));
      expect(response.status).toBe(401);
      expect(ProductController.prototype.deleteProduct).toHaveBeenCalledTimes(0);

      testLogin.mockRestore();
      testAdminOrManager.mockRestore();
    });
    test("Routes_6.4: User not admin or manager. It should return a 401 error", async ()=>{
      const model= "testModel"
      const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
          return next();
      })
      const testAdminOrManager = jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => {
        return res.status(401).json({error: "User is not an admin or manager"});
      });
      const response = (await request(app).delete(baseURL + "/products/" + model));
      expect(response.status).toBe(401);    
      expect(ProductController.prototype.deleteProduct).toHaveBeenCalledTimes(0);

      testLogin.mockRestore();
      testAdminOrManager.mockRestore();
    });

});  
  describe('Routes_7: DELETE /products', () => {
    test('Routes_7.1: Delete all products correctly.It should return a 200 success code', async () => {
      const testController = jest.spyOn(ProductController.prototype, 'deleteAllProducts').mockResolvedValue(true);
      const testLogin = jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => {
        return next();
      });
      const testAdminOrManager = jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => {
        return next();
      });
      const response= (await request(app).delete(baseURL + '/products'));
      expect(response.status).toBe(200);
      expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalledTimes(1);
      
      testController.mockRestore();
      testLogin.mockRestore();
      testAdminOrManager.mockRestore();
    });

    test("Routes_7.2: User not logged in. It should return a 401 error", async ()=>{
      const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
          return res.status(401).json({error: "Unauthenticated user"})
      })
      const testAdminOrManager = jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => {
        return res.status(401).json({error: "User is not an admin or manager"});
      });

      const response = (await request(app).delete(baseURL + "/products"));
      expect(response.status).toBe(401);
      expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalledTimes(0);   

      testLogin.mockRestore();
      testAdminOrManager.mockRestore();
    });
    
    test("Routes_7.3: User not admin or manager. It should return a 401 error", async ()=>{
      const testLogin=jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res,next)=>{
          return next();
      })
      const testAdminOrManager = jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => {
        return res.status(401).json({error: "User is not an admin or manager"});
      });

      const response = (await request(app).delete(baseURL + "/products"));
      expect(response.status).toBe(401);
      expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalledTimes(0);

      testLogin.mockRestore();
      testAdminOrManager.mockRestore();
    });

    test("Routes_7.4: Delete all products failed. It should return an error", async ()=>{
      const testController = jest.spyOn(ProductController.prototype, 'deleteAllProducts').mockRejectedValue(new Error);
      
      const testLogin = jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => {
        return next();
      });
      const testAdminOrManager = jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => {
        return next();
      });
      const response= (await request(app).delete(baseURL + '/products'));
      expect(response.status).toBe(503);
      expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalledTimes(1);
      
      testController.mockRestore();
      testLogin.mockRestore();
      testAdminOrManager.mockRestore();
  });
});
});