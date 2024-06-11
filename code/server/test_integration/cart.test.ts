import { describe, test, expect, beforeEach, beforeAll, afterEach, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import db from "../src/db/db"
import { response } from "express"
import { cleanup } from "../src/db/cleanup"

const routePath = "/ezelectronics" //Base route path for the API

//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: Role.CUSTOMER }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: Role.ADMIN }
const adminInfo = { username: "admin", password: "admin" }
const custInfo = { username: "customer", password: "customer" }

//Cookies for the users. We use them to keep users logged in. Creating them once and saving them in a variables outside of the tests will make cookies reusable
let adminCookie: string
let managerCookie: string
let customerCookie: string

//Helper function that creates a new user in the database.
//Can be used to create a user before the tests or in the tests
const postUser = async (userInfo: any) => {
    await request(app)
        .post(`/ezelectronics/users`)
        .send(userInfo)
        .expect(200)
}

//Helper function that logs in a user and returns the cookie
//Can be used to log in a user before the tests or in the tests
const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`/ezelectronics/sessions`)
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

//After executing tests, we remove everything from our test database
afterAll(async () => {
    await cleanup();
    db.close();
})



