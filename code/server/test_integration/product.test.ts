import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import {cleanupAsync} from "../src/db/cleanup"
import {Role } from "../src/components/user"
import db from "../src/db/db"
import dayjs from "dayjs";
const routePath = "/ezelectronics" //Base route path for the API

//Default user and product information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: Role.CUSTOMER }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: Role.ADMIN }
const adminInfo = { username: "admin", password: "admin" }
const customerInfo = { username: "customer", password: "customer" }
const productInfo1 = {model: "model1", category: "Smartphone", quantity: 3, details: "aa", sellingPrice: 15, arrivalDate: "2022-12-12"};
const productInfo2 = {model: "model2", category: "Appliance", quantity: 5, details: "bb", sellingPrice: 20, arrivalDate: "2023-10-27"};
const productInfo3 = {model: "model3", category: "Smartphone", quantity: 4, details: "cc", sellingPrice: 32, arrivalDate: "2023-02-06"};

//Cookies for the users. We use them to keep users logged in. Creating them once and saving them in a variables outside of the tests will make cookies reusable
let customerCookie: string
let adminCookie: string

//Helper function that logs in a user and returns the cookie
//Can be used to log in a user before the tests or in the tests
const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(routePath + "/sessions")
            .send(userInfo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.header["set-cookie"][0])
            })
    })
}

//Helper function that creates a new user in the database.
//Can be used to create a user before the tests or in the tests
//Is an implicit test because it checks if the return code is successful
const postUser = async (user: any) => {
    await request(app)
        .post(`/ezelectronics/users`)
        .send(user)
        .expect(200)
}

describe("Product routes integration tests", () => {
    beforeAll(async () => {
        await cleanupAsync();
    })

    beforeEach(async () => {
        await postUser(admin);
        await postUser(customer)
        adminCookie = await login(adminInfo);
        customerCookie = await login(customerInfo)
    });

    afterEach(async () => {
        await cleanupAsync();
    });

    //After executing tests, we remove everything from our test database
    afterAll(async () => {
        db.close();
    });

    describe("ProductAPI_1: POST /products", () => {
        test("ProductAPI_1.1: It should return a 200 success code and register a new product", async () => {
            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            const query = new URLSearchParams();
            const url = `${routePath}/products?${query.toString()}`;

            const product = await request(app)
                .get(url)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(product.body).toHaveLength(1);
            expect(product.body[0]).toEqual(productInfo1);
        })

        test("ProductAPI_1.1: It should return a 200 success code and register a new product", async () => {
            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            const query = new URLSearchParams();
            const url = `${routePath}/products?${query.toString()}`;

            const product = await request(app)
                .get(url)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(product.body).toHaveLength(1);
            expect(product.body[0]).toEqual(productInfo1);
        })

        test("ProductAPI_1.2: It should return a 409 error code if the product already exists", async () => {
            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(409);
        })

        test("ProductAPI_1.3: It should return a 400 error code if arrivalDate is in the future", async () => {
            let testProd = {...productInfo1};
            testProd.arrivalDate = "2345/08/12"

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(testProd)
                .expect(400);
        })

        test("ProductAPI_1.4: It should return a 422 error code if at least one request body parameter is empty/missing", async () => {
            await request(app).post(routePath + "/products").set("Cookie", adminCookie).send({model: "", category: "Smartphone", quantity: 3, details: "aa", sellingPrice: 15, arrivalDate: "2022/12/12"}).expect(422);
            await request(app).post(routePath + "/products").set("Cookie", adminCookie).send({model: "model", category: "", quantity: 3, details: "aa", sellingPrice: 15, arrivalDate: "2022/12/12"}).expect(422);
            await request(app).post(routePath + "/products").set("Cookie", adminCookie).send({model: "model", category: "Smartphone", quantity: null, details: "aa", sellingPrice: 15, arrivalDate: "2022/12/12"}).expect(422);
            await request(app).post(routePath + "/products").set("Cookie", adminCookie).send({model: "model", category: "Smartphone", quantity: 3, details: "aa", sellingPrice: null, arrivalDate: "2022/12/12"}).expect(422);
        })
    })

    describe("ProductAPI_2: PATCH /products/:model", () => {
        test("ProductAPI_2.1: It should return a 200 success code and increase the available quantity of a product", async () => {
            const body = {quantity: 20};

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .patch(routePath + "/products/" + productInfo1.model)
                .set("Cookie", adminCookie)
                .send(body)
                .expect(200);

            const query = new URLSearchParams();
            const url = `${routePath}/products?${query.toString()}`;

            const product = await request(app)
                .get(url)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(product.body).toHaveLength(1);
            expect(product.body[0].model).toEqual(productInfo1.model);
            expect(product.body[0].category).toEqual(productInfo1.category);
            expect(product.body[0].quantity).toEqual(productInfo1.quantity + body.quantity);
            expect(product.body[0].details).toEqual(productInfo1.details);
            expect(product.body[0].sellingPrice).toEqual(productInfo1.sellingPrice);
            expect(product.body[0].arrivalDate).toEqual(dayjs().format("YYYY-MM-DD"));
        })

        test("ProductAPI_2.2: It should return a 404 error code if the product does not exist", async () => {
            const body = {quantity: 20};

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .patch(routePath + "/products/" + "thisDoesNotExist")
                .set("Cookie", adminCookie)
                .send(body)
                .expect(404);
        })

        test("ProductAPI_2.3: It should return a 400 error code if changeDate is in the future", async () => {
            const body = {quantity: 20, changeDate: "2345-12-31"};

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .patch(routePath + "/products/" + productInfo1.model)
                .set("Cookie", adminCookie)
                .send(body)
                .expect(400);
        })

        test("ProductAPI_2.3: It should return a 400 error code if changeDate is before the current product's arrivalDate", async () => {
            const body = {quantity: 20, changeDate: "1600-12-31"};

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .patch(routePath + "/products/" + productInfo1.model)
                .set("Cookie", adminCookie)
                .send(body)
                .expect(400);
        })

        test("ProductAPI_2.4: It should return a 422 error code if at least one request body parameter is empty/missing", async () => {

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app).patch(routePath + "/products/" + productInfo1.model).set("Cookie", adminCookie).send({quantity: 0}).expect(422);
            await request(app).patch(routePath + "/products/" + productInfo1.model).set("Cookie", adminCookie).send({quantity: 20, changeDate: "2024/4/12"}).expect(422);
        })
    })

    describe("ProductAPI_3: PATCH /products/:model/sell", () => {
        test("ProductAPI_3.1: It should return a 200 success code and decrease the product's quantity", async () => {
            const body = {quantity: 2}

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .patch(routePath + "/products/" + productInfo1.model + "/sell")
                .set("Cookie", adminCookie)
                .send(body)
                .expect(200);

            const query = new URLSearchParams();
            const url = `${routePath}/products?${query.toString()}`;

            const product = await request(app)
                .get(url)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(product.body).toHaveLength(1);
            expect(product.body[0].model).toEqual(productInfo1.model);
            expect(product.body[0].category).toEqual(productInfo1.category);
            expect(product.body[0].quantity).toEqual(productInfo1.quantity - body.quantity);
            expect(product.body[0].details).toEqual(productInfo1.details);
            expect(product.body[0].sellingPrice).toEqual(productInfo1.sellingPrice);
            expect(product.body[0].arrivalDate).toEqual(productInfo1.arrivalDate);
        })

        test("ProductAPI_3.2: It should return a 404 error code if the product does not exist", async () => {
            const body = {quantity: 2}

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .patch(routePath + "/products/" + "thisDoesNotExist" + "/sell")
                .set("Cookie", adminCookie)
                .send(body)
                .expect(404);
        })

        test("ProductAPI_3.3: It should return a 400 error code if sellingDate is in the future", async () => {
            const body = {quantity: 2, sellingDate: "2345-12-31"}

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .patch(routePath + "/products/" + productInfo1.model + "/sell")
                .set("Cookie", adminCookie)
                .send(body)
                .expect(400);
        })

        test("ProductAPI_3.4: It should return a 400 error code if sellingDate is before the product's current arrivalDate", async () => {
            const body = {quantity: 2, sellingDate: "1600-12-31"}

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .patch(routePath + "/products/" + productInfo1.model + "/sell")
                .set("Cookie", adminCookie)
                .send(body)
                .expect(400);
        })

        test("ProductAPI_3.5: It should return a 409 error code if the product's available quantity is 0", async () => {
            const body = {quantity: 3}

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .patch(routePath + "/products/" + productInfo1.model + "/sell")
                .set("Cookie", adminCookie)
                .send(body)
                .expect(200);

            await request(app)
                .patch(routePath + "/products/" + productInfo1.model + "/sell")
                .set("Cookie", adminCookie)
                .send(body)
                .expect(409);
        })

        test("ProductAPI_3.6: It should return a 409 error code if the provided quantity is higher than the product's available quantity", async () => {
            const body = {quantity: 4}

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .patch(routePath + "/products/" + productInfo1.model + "/sell")
                .set("Cookie", adminCookie)
                .send(body)
                .expect(409);
        })

        test("ProductAPI_3.7: It should return a 422 error code if at least one request body parameter is empty/missing", async () => {

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app).patch(routePath + "/products/" + productInfo1.model).set("Cookie", adminCookie).send({quantity: 0}).expect(422);
            await request(app).patch(routePath + "/products/" + productInfo1.model).set("Cookie", adminCookie).send({quantity: 20, changeDate: "2024/4/12"}).expect(422);
        })
    });

    describe("ProductAPI_4: GET /products", () => {
        test("ProductAPI_4.1: It should return a 200 success code and retrieve all the products", async () => {
            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo2)
                .expect(200);

            const query = new URLSearchParams();
            const url = `${routePath}/products?${query.toString()}`;

            const product = await request(app)
                .get(url)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(product.body).toHaveLength(2);
            expect(product.body[0]).toEqual(productInfo1);
            expect(product.body[1]).toEqual(productInfo2);
        });

        test("ProductAPI_4.2: It should return a 200 success code and retrieve the products according to the category grouping", async () => {
            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo2)
                .expect(200);

            const query = new URLSearchParams();
            query.append('grouping', 'category');
            query.append('category', productInfo1.category);
            const url = `${routePath}/products?${query.toString()}`;

            const product = await request(app)
                .get(url)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(product.body).toHaveLength(1);
            expect(product.body[0]).toEqual(productInfo1);
        });

        test("ProductAPI_4.3: It should return a 200 success code and retrieve the products according to the model grouping", async () => {
            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo2)
                .expect(200);

            const query = new URLSearchParams();
            query.append('grouping', 'model');
            query.append('model', productInfo2.model);
            const url = `${routePath}/products?${query.toString()}`;

            const product = await request(app)
                .get(url)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(product.body).toHaveLength(1);
            expect(product.body[0]).toEqual(productInfo2);
        });

        test("ProductAPI_4.4: It should return a 404 error code when model does not represent an existing product", async () => {
            const query = new URLSearchParams();
            query.append('grouping', 'model');
            query.append('model', productInfo1.model);
            const url = `${routePath}/products?${query.toString()}`;

            const product = await request(app)
                .get(url)
                .set("Cookie", adminCookie)
                .expect(404)
        });

        test("ProductAPI_4.6: It should return a 422 error code if the grouping is invalid", async () => {
            const query1 = new URLSearchParams();
            const query2 = new URLSearchParams();
            const query3 = new URLSearchParams();
            const query4 = new URLSearchParams();

            query1.append('grouping', 'model');
            query1.append('model', productInfo1.model);
            query1.append('category', productInfo1.category);
            const url1 = `${routePath}/products?${query1.toString()}`;

            query2.append('grouping', 'category');
            query2.append('model', productInfo1.model);
            query2.append('category', productInfo1.category);
            const url2 = `${routePath}/products?${query2.toString()}`;

            query3.append('grouping', 'model');
            const url3 = `${routePath}/products?${query3.toString()}`;

            query4.append('grouping', 'category');
            const url4 = `${routePath}/products?${query4.toString()}`;

            await request(app).get(url1).set("Cookie", adminCookie).expect(422);
            await request(app).get(url2).set("Cookie", adminCookie).expect(422);
            await request(app).get(url3).set("Cookie", adminCookie).expect(422);
            await request(app).get(url4).set("Cookie", adminCookie).expect(422);
        });
    });

    describe("ProductAPI_5: GET /products/available", () => {
        test("ProductAPI_5.1: It should return a 200 success code and retrieve all the available products", async () => {
            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo2)
                .expect(200);

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo3)
                .expect(200);

            await request(app)
                .patch(routePath + "/products/" + productInfo3.model + "/sell")
                .set("Cookie", adminCookie)
                .send({quantity: productInfo3.quantity})
                .expect(200);

            const query = new URLSearchParams();
            const url = `${routePath}/products/available?${query.toString()}`;

            const product = await request(app)
                .get(url)
                .set("Cookie", customerCookie)
                .expect(200)

            expect(product.body).toHaveLength(2);
            expect(product.body[0]).toEqual(productInfo1);
            expect(product.body[1]).toEqual(productInfo2);
        });

        test("ProductAPI_5.2: It should return a 200 success code and retrieve the available products according to the category grouping", async () => {
            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo2)
                .expect(200);

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo3)
                .expect(200);

            await request(app)
                .patch(routePath + "/products/" + productInfo3.model + "/sell")
                .set("Cookie", adminCookie)
                .send({quantity: productInfo3.quantity})
                .expect(200);

            const query = new URLSearchParams();
            query.append('grouping', 'category');
            query.append('category', productInfo1.category);
            const url = `${routePath}/products/available?${query.toString()}`;

            const product = await request(app)
                .get(url)
                .set("Cookie", customerCookie)
                .expect(200)

            expect(product.body).toHaveLength(1);
            expect(product.body[0]).toEqual(productInfo1);
        });

        test("ProductAPI_5.3: It should return a 200 success code and retrieve the available products according to the model grouping", async () => {
            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo1)
                .expect(200);

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo2)
                .expect(200);

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo3)
                .expect(200);

            await request(app)
                .patch(routePath + "/products/" + productInfo3.model + "/sell")
                .set("Cookie", adminCookie)
                .send({quantity: productInfo3.quantity})
                .expect(200);

            const query = new URLSearchParams();
            query.append('grouping', 'model');
            query.append('model', productInfo2.model);
            const url = `${routePath}/products/available?${query.toString()}`;

            const product = await request(app)
                .get(url)
                .set("Cookie", customerCookie)
                .expect(200)

            expect(product.body).toHaveLength(1);
            expect(product.body[0]).toEqual(productInfo2);
        });

        test("ProductAPI_5.4: It should return a 404 error code when model does not represent an existing product", async () => {
            const query = new URLSearchParams();
            query.append('grouping', 'model');
            query.append('model', productInfo1.model);
            const url = `${routePath}/products/available?${query.toString()}`;

            await request(app)
                .get(url)
                .set("Cookie", customerCookie)
                .expect(404)
        });

        test("ProductAPI_5.6: It should return a 422 error code if the grouping is invalid", async () => {
            const query1 = new URLSearchParams();
            const query2 = new URLSearchParams();
            const query3 = new URLSearchParams();
            const query4 = new URLSearchParams();

            query1.append('grouping', 'model');
            query1.append('model', productInfo1.model);
            query1.append('category', productInfo1.category);
            const url1 = `${routePath}/products/available?${query1.toString()}`;

            query2.append('grouping', 'category');
            query2.append('model', productInfo1.model);
            query2.append('category', productInfo1.category);
            const url2 = `${routePath}/products/available?${query2.toString()}`;

            query3.append('grouping', 'model');
            const url3 = `${routePath}/products/available?${query3.toString()}`;

            query4.append('grouping', 'category');
            const url4 = `${routePath}/products/available?${query4.toString()}`;

            await request(app).get(url1).set("Cookie", customerCookie).expect(422);
            await request(app).get(url2).set("Cookie", customerCookie).expect(422);
            await request(app).get(url3).set("Cookie", customerCookie).expect(422);
            await request(app).get(url4).set("Cookie", customerCookie).expect(422);
        });
    });
});
