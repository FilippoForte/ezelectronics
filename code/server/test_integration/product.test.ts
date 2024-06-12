import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import {cleanup, cleanupAsync} from "../src/db/cleanup"
import { User, Role } from "../src/components/user"
import db from "../src/db/db"
const routePath = "/ezelectronics" //Base route path for the API

//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: Role.CUSTOMER }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: Role.ADMIN }
const adminInfo = { username: "admin", password: "admin" }
const custInfo = { username: "customer", password: "customer" }
const productInfo = {model: "model", category: "Smartphone", quantity: 3, details: "aa", sellingPrice: 15, arrivalDate: "2022/12/12"};

//Cookies for the users. We use them to keep users logged in. Creating them once and saving them in a variables outside of the tests will make cookies reusable
let customerCookie: string
let adminCookie: string

//Helper function that creates a new user in the database.
//Can be used to create a user before the tests or in the tests
//Is an implicit test because it checks if the return code is successful

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

const postUser = async (user: any) => {
    await request(app)
        .post(`/ezelectronics/users`)
        .send(user)
        .expect(200)
}

describe("Product routes integration tests", () => {
    let loggedAdmin: any;

    beforeAll(async () => {
        await cleanupAsync();
    })

    beforeEach(async () => {
        await postUser(admin);
        adminCookie = await login(adminInfo);
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
                .send(productInfo)
                .expect(200);

            const query = new URLSearchParams();
            const url = `${routePath}/products?${query.toString()}`;

            const product = await request(app)
                .get(url)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(product.body).toHaveLength(1);
            expect(product.body[0]).toEqual(productInfo);
        })

        test("ProductAPI_1.1: It should return a 200 success code and register a new product", async () => {
            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo)
                .expect(200);

            const query = new URLSearchParams();
            const url = `${routePath}/products?${query.toString()}`;

            const product = await request(app)
                .get(url)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(product.body).toHaveLength(1);
            expect(product.body[0]).toEqual(productInfo);
        })

        test("ProductAPI_1.2: It should return a 409 error code if the product already exists", async () => {
            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo)
                .expect(200);

            await request(app)
                .post(routePath + "/products")
                .set("Cookie", adminCookie)
                .send(productInfo)
                .expect(409);
        })

        test("ProductAPI_1.3: It should return a 400 error code if the arrivalDate is in the future", async () => {
            let testProd = {...productInfo};
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
})
