import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import {cleanupAsync} from "../src/db/cleanup"
import {Role } from "../src/components/user"
import db from "../src/db/db"
import dayjs from "dayjs";
const routePath = "/ezelectronics" //Base route path for the API

//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: Role.CUSTOMER }
const customer1 = { username: "customer1", name: "customer1", surname: "customer1", password: "customer1", role: Role.CUSTOMER }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: Role.ADMIN }
const adminInfo = { username: "admin", password: "admin" }
const customerInfo = { username: "customer", password: "customer" }
const customerInfo1 = { username: "customer1", password: "customer1" }
const productInfo1 = {model: "model1", category: "Smartphone", quantity: 3, details: "aa", sellingPrice: 15, arrivalDate: "2022-12-12"};
const productInfo2 = {model: "model2", category: "Smartphone", quantity: 5, details: "bb", sellingPrice: 20, arrivalDate: "2022-12-12"};
const review1 = {model: "model1", user: "customer", score: 3, date: "2024-06-12", comment: "commento1"};
const review2 = {model: "model2", user: "customer", score: 5, date: "2024-06-13", comment: "commento2"};
const review3 = {model: "model1", user: "customer", score: 10, date: "2024-06-13", comment: "commento2"};
const review4 = {model: "model1", user: "customer", score: 5, date: "2024-06-13", comment: "commento4"};


//Cookies for the users. We use them to keep users logged in. Creating them once and saving them in a variables outside of the tests will make cookies reusable
let customerCookie: string
let customerCookie1: string
let adminCookie: string

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

const postProduct = async (product: any) => {
    await request(app)
        .post(routePath + "/products")
        .set("Cookie", adminCookie)
        .send(product)
        .expect(200);
}

describe("Product routes integration tests", () => {
    beforeAll(async () => {
        jest.setTimeout(20000);
        await cleanupAsync();
    })

    beforeEach(async () => {
        await postUser(admin);
        await postUser(customer)
        await postUser(customer1)
        adminCookie = await login(adminInfo);
        customerCookie = await login(customerInfo);
        customerCookie1 = await login(customerInfo1);
        await postProduct(productInfo1);
    });

    afterEach(async () => {
        await cleanupAsync();
    });

    //After executing tests, we remove everything from our test database
    afterAll(async () => {
        db.close();
    });

    describe("ReviewAPI_1: POST /reviews/:model", () => {
        test("ReviewAPI_1.1: It should return a 200 success code and register a new review", async () => {
            await request(app)
                .post(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .send(review1)
                .expect(200);
        })

        test("ReviewAPI_1.2: It should return a 409 error code if the review already exists", async () => {
            await request(app)
                .post(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .send(review1)
                .expect(200);
            await request(app)
                .post(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .send(review1)
                .expect(409);
        })

        test("ReviewAPI_1.3: It should return a 404 error if the product of the review doesn't exist", async () => {
            await request(app)
                .post(routePath + "/reviews/" + review2.model)
                .set("Cookie", customerCookie)
                .send(review2)
                .expect(404);
        })

        test("ReviewAPI_1.4: It should return a 401 error if the user is not a customes", async () => {
            await request(app)
                .post(routePath + "/reviews/" + review1.model)
                .set("Cookie", adminCookie)
                .send(review1)
                .expect(401);
        })

        test("ReviewAPI_1.5: It should return a 422 error code if at least one request body parameter is empty/wrong", async () => {
            await request(app)
                .post(routePath + "/reviews/" + review3.model)
                .set("Cookie", customerCookie)
                .send(review3)
                .expect(422);
        })
    })

    describe("ReviewAPI_2: GET /reviews/:model", () => {
        test("ReviewAPI_2.1: It should return a 200 success code and retrieve all the review for the product selected", async () => {
            await request(app)
                .post(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .send(review1)
                .expect(200);
            await request(app)
                .post(routePath + "/reviews/" + review4.model)
                .set("Cookie", customerCookie1)
                .send(review4)
                .expect(200);
            const review = await request(app)
                .get(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .expect(200);
            expect(review.body).toHaveLength(2);
        })

        test("ReviewAPI_2.2: It should return a 401 error if the user is not authenticated", async () => {
            await request(app)
                .post(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .send(review1)
                .expect(200);
            await request(app)
                .post(routePath + "/reviews/" + review4.model)
                .set("Cookie", customerCookie1)
                .send(review4)
                .expect(200);
            await request(app)
                .get(routePath + "/reviews/" + review1.model)
                .expect(401);
        })
    })

    describe("ReviewAPI_3: DELETE /reviews/:model", () => {
        test("ReviewAPI_3.1: It should return a 200 success code and delete the review for the product selected for the user logged", async () => {
            await request(app)
                .post(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .send(review1)
                .expect(200);
            await request(app)
                .post(routePath + "/reviews/" + review4.model)
                .set("Cookie", customerCookie1)
                .send(review4)
                .expect(200);
            await request(app)
                .delete(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .expect(200);
            const review = await request(app)
                .get(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .expect(200);
            expect(review.body).toHaveLength(1);
        })

        test("ReviewAPI_3.2: It should return a 401 error if the user is not authenticated", async () => {
            await request(app)
                .post(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .send(review1)
                .expect(200);
            await request(app)
                .delete(routePath + "/reviews/" + review1.model)
                .expect(401);
        })

        test("ReviewAPI_3.3: It should return a 404 error if the product of the review doesn't exist", async () => {
            await request(app)
                .delete(routePath + "/reviews/" + review2.model)
                .set("Cookie", customerCookie)
                .expect(404);
        })

        test("ReviewAPI_3.4: It should return a 404 error if the product doesn't have a review of the logged user", async () => {
            await request(app)
                .delete(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .expect(404);
        })
    })

    describe("ReviewAPI_4: DELETE /reviews/:model/all", () => {
        test("ReviewAPI_4.1: It should return a 200 success code and delete all the review for the product selected", async () => {
            await request(app)
                .post(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .send(review1)
                .expect(200);
            await request(app)
                .post(routePath + "/reviews/" + review4.model)
                .set("Cookie", customerCookie1)
                .send(review4)
                .expect(200);
            await request(app)
                .delete(routePath + "/reviews/" + review1.model + "/all")
                .set("Cookie", adminCookie)
                .expect(200);
            const review = await request(app)
                .get(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .expect(200);
            expect(review.body).toHaveLength(0);
        })

        test("ReviewAPI_4.2: It should return a 401 error if the user is not ad admin", async () => {
            await request(app)
                .post(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .send(review1)
                .expect(200);
            await request(app)
                .post(routePath + "/reviews/" + review4.model)
                .set("Cookie", customerCookie1)
                .send(review4)
                .expect(200);
            await request(app)
                .delete(routePath + "/reviews/" + review1.model + "/all")
                .set("Cookie", customerCookie)
                .expect(401);
        })

        test("ReviewAPI_4.3: It should return a 404 error if the product of the review doesn't exist", async () => {
            await request(app)
                .delete(routePath + "/reviews/" + review2.model + "/all")
                .set("Cookie", adminCookie)
                .expect(404);
        })
    })

    describe("ReviewAPI_5: DELETE /reviews", () => {
        test("ReviewAPI_5.1: It should return a 200 success code and delete all the review", async () => {
            await postProduct(productInfo2);
            await request(app)
                .post(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .send(review1)
                .expect(200);
            await request(app)
                .post(routePath + "/reviews/" + review4.model)
                .set("Cookie", customerCookie1)
                .send(review4)
                .expect(200);
            await request(app)
                .post(routePath + "/reviews/" + review2.model)
                .set("Cookie", customerCookie1)
                .send(review2)
                .expect(200);
            await request(app)
                .delete(routePath + "/reviews")
                .set("Cookie", adminCookie)
                .expect(200);
            const r = await request(app)
                .get(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .expect(200);
            expect(r.body).toHaveLength(0);
            const r1 = await request(app)
                .get(routePath + "/reviews/" + review2.model)
                .set("Cookie", customerCookie)
                .expect(200);
            expect(r1.body).toHaveLength(0);
        })

        test("ReviewAPI_5.2: It should return a 401 error if the user is not ad admin", async () => {
            await postProduct(productInfo2);
            await request(app)
                .post(routePath + "/reviews/" + review1.model)
                .set("Cookie", customerCookie)
                .send(review1)
                .expect(200);
            await request(app)
                .post(routePath + "/reviews/" + review4.model)
                .set("Cookie", customerCookie1)
                .send(review4)
                .expect(200);
            await request(app)
                .post(routePath + "/reviews/" + review2.model)
                .set("Cookie", customerCookie1)
                .send(review2)
                .expect(200);
            await request(app)
                .delete(routePath + "/reviews")
                .set("Cookie", customerCookie)
                .expect(401);
        })
    })
})