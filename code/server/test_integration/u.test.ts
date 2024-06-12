import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { cleanup } from "../src/db/cleanup"
import { User, Role } from "../src/components/user"
import db from "../src/db/db"
const routePath = "/ezelectronics" //Base route path for the API

//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: Role.CUSTOMER }
const customer2 = { username: "customer2", name: "customer2", surname: "customer2", password: "customer2", role: Role.CUSTOMER }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: Role.ADMIN }
const admin2= { username: "admin2", name: "admin2", surname: "admin2", password: "admin2", role: Role.ADMIN }
const adminInfo = { username: "admin", password: "admin" }
const custInfo = { username: "customer", password: "customer" }
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

//Before executing tests, we remove everything from our test database, create an Admin user and log in as Admin, saving the cookie in the corresponding variable


//After executing tests, we remove everything from our test database
afterAll(async () => {
    await cleanup();
    db.close();
})


//A 'describe' block is a way to group tests. It can be used to group tests that are related to the same functionality
//In this example, tests are for the user routes
//Inner 'describe' blocks define tests for each route
describe("User routes integration tests", () => {
    describe("POST /users", () => {
        //A 'test' block is a single test. It should be a single logical unit of testing for a specific functionality and use case (e.g. correct behavior, error handling, authentication checks)
        test("It should return a 200 success code and create a new user", async () => {
            //A 'request' function is used to send a request to the server. It is similar to the 'fetch' function in the browser
            //It executes an API call to the specified route, similarly to how the client does it
            //It is an actual call, with no mocking, so it tests the real behavior of the server
            //Route calls are asynchronous operations, so we need to use 'await' to wait for the response


            await request(app)
                .post(routePath + "/users")
                .send({ username: "customer", name: "customer", surname: "customer", password: "customer", role: Role.CUSTOMER })
                .expect(200)

            //The 'expect' block is used to check the response status code. We expect a 200 status code for a successful operation

            //After the request is sent, we can add additional checks to verify the operation, since we need to be sure that the user is present in the database
            //A possible way is retrieving all users and looking for the user we just created.
            await request(app).post(routePath + "/users").send({ username: "admin", name: "admin", surname: "admin", password: "admin", role: Role.ADMIN }).expect(200)

            const loginAdmin = await request(app)
                .post(routePath + "/sessions")
                .send({ username: "admin", password: "admin" })
            expect(loginAdmin.status).toBe(200)


            const users = await request(app) //It is possible to assign the response to a variable and use it later. 
                .get(`${routePath}/users`)
                .set("Cookie", loginAdmin.header["set-cookie"][0]) //Authentication is specified with the 'set' block. Adding a cookie to the request will allow authentication (if the cookie has been created with the correct login route). Without this cookie, the request will be unauthorized
                .expect(200)


            expect(users.body).toHaveLength(2) //Since we know that the database was empty at the beginning of our tests and we created two users (an Admin before starting and a Customer in this test), the array should contain only two users
            let cust = users.body.find((user: any) => user.username === customer.username) //We look for the user we created in the array of users
            expect(cust).toBeDefined() //We expect the user we have created to exist in the array. The parameter should also be equal to those we have sent
            expect(cust.name).toBe(customer.name)
            expect(cust.surname).toBe(customer.surname)
            expect(cust.role).toBe(customer.role)
        })

        //Tests for error conditions can be added in separate 'test' blocks.
        //We can group together tests for the same condition, no need to create a test for each body parameter, for example
        test("It should return a 422 error code if at least one request body parameter is empty/missing", async () => {
            await request(app)
                .post(`${routePath}/users`)
                .send({ username: "", name: "test", surname: "test", password: "test", role: "Customer" }) //We send a request with an empty username. The express-validator checks will catch this and return a 422 error code
                .expect(422)
            await request(app).post(`${routePath}/users`).send({ username: "test", name: "", surname: "test", password: "test", role: "Customer" }).expect(422) 
            await request(app).post(`${routePath}/users`).send({ username: "test", name: "test", surname: "", password: "test", role: "Customer" }).expect(422) 
            await request(app).post(`${routePath}/users`).send({ username: "test", name: "test", surname: "test", password: "", role: "Customer" }).expect(422) 
            await request(app).post(`${routePath}/users`).send({ username: "test", name: "test", surname: "test", password: "test", role: "" }).expect(422) 

        })
        test("It should return a 409 error code if the username already exists", async () => {
            await request(app).post(`${routePath}/users`).send({ username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }).expect(409)
        })
    })

    describe("GET /users", () => {
        test("It should return an array of users", async () => {
            
            const loginAdmin = await request(app)
                .post(routePath + "/sessions")
                .send({ username: "admin", password: "admin" })
            expect(loginAdmin.status).toBe(200)


            const users = await request(app).get(`${routePath}/users`).set("Cookie", loginAdmin.header["set-cookie"][0]).expect(200)
            expect(users.body).toHaveLength(2)
            let cust = users.body.find((user: any) => user.username === customer.username)
            expect(cust).toBeDefined()
            expect(cust.name).toBe(customer.name)
            expect(cust.surname).toBe(customer.surname)
            expect(cust.role).toBe(customer.role)
            let adm = users.body.find((user: any) => user.username === admin.username)
            expect(adm).toBeDefined()
            expect(adm.name).toBe(admin.name)
            expect(adm.surname).toBe(admin.surname)
            expect(adm.role).toBe(admin.role)
        })

        test("It should return a 401 error code if the user is not an Admin", async () => {
            customerCookie = await login(customer)
            await request(app).get(`${routePath}/users`).set("Cookie", customerCookie).expect(401) //We call the same route but with the customer cookie. The 'expect' block must be changed to validate the error

        })
        test("It should return a 401 error code if the user is not logged in", async () => {
            await request(app).get(`${routePath}/users`).expect(401) //We can also call the route without any cookie. The result should be the same
        })
    })

    describe("GET /users/roles/:role", () => {
        
        test("It should return a 200 success code andan array of users with a specific role", async () => {
            //Route parameters are set in this way by placing directly the value in the path
            //It is not possible to send an empty value for the role (/users/roles/ will not be recognized as an existing route, it will return 404)
            //Empty route parameters cannot be tested in this way, but there should be a validation block for them in the route
            
            const loginAdmin = await request(app)
                .post(routePath + "/sessions")
                .send({ username: "admin", password: "admin" })
            expect(loginAdmin.status).toBe(200)

            const admins = await request(app).get(`${routePath}/users/roles/Admin`).set("Cookie",loginAdmin.header["set-cookie"][0]).expect(200)
            expect(admins.body).toHaveLength(1) //In this case, we expect only one Admin user to be returned
            let adm = admins.body[0]
            expect(adm.username).toBe(admin.username)
            expect(adm.name).toBe(admin.name)
            expect(adm.surname).toBe(admin.surname)
        })

        test("It should fail if the role is not valid", async () => {
            const loginAdmin = await request(app)
            .post(routePath + "/sessions")
            .send({ username: "admin", password: "admin" })
            expect(loginAdmin.status).toBe(200)

            //Invalid route parameters can be sent and tested in this way. The 'expect' block should contain the corresponding code
            await request(app).get(`${routePath}/users/roles/Invalid`).set("Cookie", loginAdmin.header["set-cookie"][0]).expect(422)
        })
        test("It should return a 401 error code if the user is not an Admin", async () => {
            customerCookie = await login(customer)
            await request(app).get(`${routePath}/users/roles/Admin`).set("Cookie", customerCookie).expect(401)
        })
        test("It should return a 401 error code if the user is not logged in", async () => {
            await request(app).get(`${routePath}/users/roles/Admin`).expect(401)
        })
    })
    //get users/:username
    describe("GET /users/:username", () => {

        test("It should return a 200 success code and the user with the specified username", async () => {
            customerCookie = await login(customer)

            const user = await request(app).get(`${routePath}/users/${customer.username}`).set("Cookie", customerCookie).expect(200)

            expect(user.body.username).toBe(customer.username)
            expect(user.body.name).toBe(customer.name)
            expect(user.body.surname).toBe(customer.surname)
            expect(user.body.role).toBe(customer.role)
            
            adminCookie = await login(admin)
            const user2 = await request(app).get(`${routePath}/users/${customer.username}`).set("Cookie", adminCookie).expect(200)

            expect(user2.body.username).toBe(customer.username)
            expect(user2.body.name).toBe(customer.name)
            expect(user2.body.surname).toBe(customer.surname)
            expect(user2.body.role).toBe(customer.role)
        })

        test("It should return a 401 error code if the user is not logged in", async () => {
            await request(app).get(`${routePath}/users/${customer.username}`).expect(401)
        })

        test("It should return a 401 error code if the user is different than the one logged in and is not an Admin", async () => {
            customerCookie = await login(customer)
            await request(app).get(`${routePath}/users/${admin.username}`).set("Cookie", customerCookie).expect(401)
        })
        test("It should return a 404 error code if the user does not exist", async () => {
            adminCookie = await login(admin)
            await request(app).get(`${routePath}/users/Invalid`).set("Cookie", adminCookie).expect(404)
        })
    
    })
    describe("DELETE /users/:username", () => {

        test("It should delete the user with the specified username", async () => {
            customerCookie = await login(customer)

            await request(app).delete(`${routePath}/users/${customer.username}`).set("Cookie", customerCookie).expect(200)
            adminCookie = await login(admin)
            const users = await request(app).get(`${routePath}/users`).set("Cookie", adminCookie).expect(200)
            expect(users.body).toHaveLength(1)
            expect(users.body.find((user: any) => user.username === customer.username)).toBeUndefined()
        })
        test("It should return a 401 error code if the user is not logged in", async () => {
            await request(app).delete(`${routePath}/users/${customer.username}`).expect(401)
        })
        test("It should return a 401 error code if the user is different than the one logged in and is not an Admin", async () => {
            
            const customer2=
             await request(app)
                .post(routePath + "/users")
                .send({ username: "customer2", name: "customer2", surname: "customer2", password: "customer2", role: Role.CUSTOMER })
                .expect(200)
            customerCookie = await login({username: "customer2", password: "customer2"})
            await request(app).delete(`${routePath}/users/${admin.username}`).set("Cookie", customerCookie).expect(401)
        })
        test("It should return a 404 error code if the user does not exist", async () => {
            adminCookie = await login(admin)
            await request(app).delete(`${routePath}/users/Invalid`).set("Cookie", adminCookie).expect(404)
        })
        test("It should return a 401 error code if the user is an Admin and tries to delete another Admin", async () => {
            adminCookie = await login(admin)
            
            await request(app)
                .post(routePath + "/users")
                .send({ username: "admin2", name: "admin2", surname: "admin2", password: "admin2", role: Role.ADMIN })
                .expect(200)

            await request(app).delete(`${routePath}/users/admin2`).set("Cookie", adminCookie).expect(401)
    })
    })
        //DELETE ALL
        //PATCH
    describe("DELETE /users", () => {
        
        test("It should delete all non-admin users", async () => {
            
            const loginAdmin = await request(app)
                .post(routePath + "/sessions")
                .send({ username: "admin2", password: "admin2" })
            expect(loginAdmin.status).toBe(200)
            
            await request(app).delete(`${routePath}/users`).set("Cookie", loginAdmin.header["set-cookie"][0]).expect(200)
            const users = await request(app).get(`${routePath}/users/roles/Customer`).set("Cookie", adminCookie).expect(200)
            expect(users.body).toHaveLength(0)
         
        })
        test("It should return a 401 error code if the user is not logged in", async () => {
            await request(app).delete(`${routePath}/users`).expect(401)
        })
        test("It should return a 401 error code if the user is not an Admin", async () => {
            const customer2=
            await request(app)
               .post(routePath + "/users")
               .send({ username: "customer2", name: "customer2", surname: "customer2", password: "customer2", role: Role.CUSTOMER })
               .expect(200)
           customerCookie = await login({username: "customer2", password: "customer2"})
            await request(app).delete(`${routePath}/users`).set("Cookie", customerCookie).expect(401)
        })
    })
    describe("PATCH /users/:username", () => {

        test("It should update the user with the specified username", async () => {
         
           customerCookie = await login({username: "customer2", password: "customer2"})
           
            await request(app).patch(`${routePath}/users/customer2`).send({ name: "new name" , surname: "new surname", address: "new address", birthdate:"new birthdate"}).set("Cookie", customerCookie).expect(200)
            adminCookie = await login(admin)
            const user = await request(app).get(`${routePath}/users/customer2`).set("Cookie", adminCookie).expect(200)
            expect(user.body.name).toBe("new name")
            expect(user.body.surname).toBe("new surname")
            expect(user.body.address).toBe("new address")
            expect(user.body.birthdate).toBe("new birthdate")
        })

    test("It should return a 422 error if parameters are invalid", async () => {

        await request(app)
        .post(`${routePath}/users`)
        .send({ username: "test", name: "test", surname: "test", password: "test", role: "Customer" }) 
        .expect(200)

        const loginCustomer = await request(app)
            .post(routePath + "/sessions")
            .send({ username: "test", password: "test" })
        expect(loginCustomer.status).toBe(200)
        await request(app).patch(`${routePath}/users/test`).send({ name: "" , surname: "new surname", address: "new address", birthdate:"new birthdate"}).set("Cookie", customerCookie).expect(422)
        await request(app).patch(`${routePath}/users/test`).send({ name: "new name" , surname: "", address: "new address", birthdate:"new birthdate"}).set("Cookie", customerCookie).expect(422)
        await request(app).patch(`${routePath}/users/test`).send({ name: "" , surname: "new surname", address: "", birthdate:"new birthdate"}).set("Cookie", customerCookie).expect(422)
        await request(app).patch(`${routePath}/users/test`).send({ name: "" , surname: "new surname", address: "new address", birthdate:""}).set("Cookie", customerCookie).expect(422)
    })
    test("It should return a 401 error code if the user is not logged in", async () => {
        await request(app).patch(`${routePath}/users/test`).send({ name: "new name" , surname: "new surname", address: "new address", birthdate:"new birthdate"}).expect(401)
    })
    test("It should return a 404 error code if the username doesn't exist", async () => {
        adminCookie = await login(admin)
        await request(app).patch(`${routePath}/users/Invalid`).send({ name: "new name" , surname: "new surname", address: "new address", birthdate:"new birthdate"}).set("Cookie", adminCookie).expect(404)
    })
    test("It should return a 400 error if the birthdate is after the current date and before 18 years old", async () => {
        adminCookie = await login(admin)
        await request(app).patch(`${routePath}/users/test`).send({ name: "new name" , surname: "new surname", address: "new address", birthdate:"2025-01-01"}).set("Cookie", adminCookie).expect(400)
    })
    test("It should return a 401 error code if the user is not equal to the one logged in and it is not an admin", async () => { 
        await request(app)
        .post(`${routePath}/users`)
        .send({ username: "test2", name: "test2", surname: "test2", password: "test2", role: "Customer" }) 
        .expect(200)

        const loginCustomer = await request(app)
            .post(routePath + "/sessions")
            .send({ username: "test2", password: "test2" })
        expect(loginCustomer.status).toBe(200)
       
        await request(app).patch(`${routePath}/users/test`).send({ name: "new name" , surname: "new surname", address: "new address", birthdate:"new birthdate"}).set("Cookie", loginCustomer.header["set-cookie"][0]).expect(401)


    })
})
})
