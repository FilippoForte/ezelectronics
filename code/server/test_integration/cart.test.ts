import { describe, test, expect, beforeEach, beforeAll, afterEach, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import db from "../src/db/db"
import { response } from "express"
import { cleanup } from "../src/db/cleanup"
import { Role } from "../src/components/user"

const routePath = "/ezelectronics/carts" //Base route path for the API

//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: Role.CUSTOMER }
const manager = { username: "manager", name: "manager", surname: "manager", password: "manager", role: Role.MANAGER }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: Role.ADMIN }
const adminInfo = { username: "admin", password: "admin" }
const custInfo = { username: "customer", password: "customer" }

//Cookies for the users. We use them to keep users logged in. Creating them once and saving them in a variables outside of the tests will make cookies reusable
let adminCookie: string
let managerCookie: string
let customerCookie: string

const beforeAllScript = `
INSERT INTO products (model, category, quantity, details, arrivalDate, sellingPrice) VALUES
 ("iPhoneX", "Smartphone", 10, "dettaglio", "2020-12-12", 1000)`;

const runExec = (sql: string) => {
    return new Promise<void>((resolve, reject) => {
        db.exec(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

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


beforeEach(async () => {
    await runExec(beforeAllScript);

    await postUser(admin);
    adminCookie = await login({ username: admin.username, password: admin.password });

    await postUser(manager);
    managerCookie = await login({ username: manager.username, password: manager.password });

    await postUser(customer);
    customerCookie = await login({ username: customer.username, password: customer.password });

})

//After executing tests, we remove everything from our test database
afterEach(async () => {
    cleanup();
})

afterAll(async () => {
    db.close();
})

describe("CartAPI_1: addToCart method tests", () => {

    // Test for successful addition of product to cart
    test("CartAPI_1.1: It should add a product to the cart and return 200 success code", async () => {

        const model = "iPhoneX";
        // Make request to the route
        const response = await request(app).post(routePath).send({ model }).set("Cookie", customerCookie);

        // Assertions
        expect(response.status).toBe(200);

        const sql = `
            SELECT p.modelProduct as model
            FROM users u
            JOIN carts c ON u.username = c.customer
            JOIN productInCart p ON c.id = p.idCart
            WHERE u.username = ?;
        `;

        db.get(sql, [custInfo.username], (err: Error | null, row: any) => {
            expect(row).toEqual({ model });
        });

    });

    // Test for user not logged in
    test("CartAPI_1.2: It should return 401 if the user is not logged in", async () => {
        // Make request to the route
        const response = await request(app)
            .post(routePath)
            .send({ model: "some-product-model" });

        // Assertions
        expect(response.status).toBe(401);
    });

    // Test for user not being a customer
    test("CartAPI_1.3: It should return 401 if the user is not a customer", async () => {
        // Log in as admin
        const adminResponse = await request(app)
            .post('/ezelectronics/sessions')
            .send(adminInfo)
            .expect(200);

        const adminCookie = adminResponse.header["set-cookie"][0];

        // Make request to the route
        const response = await request(app)
            .post(routePath)
            .send({ model: 'some-product-model' })
            .set("Cookie", adminCookie);

        // Assertions
        expect(response.status).toBe(401);
    });

    // Test for product model not existing
    test("CartAPI_1.4: It should return 404 if the product model does not exist", async () => {
        const model = 'NonExistingProduct';

        // Make request to the route
        const response = await request(app)
            .post(routePath)
            .send({ model })
            .set("Cookie", customerCookie);

        // Assertions
        expect(response.status).toBe(404);
    });

    // Test for product model with zero available quantity
    test("CartAPI_1.5: It should return 409 if the product model has zero available quantity", async () => {
        // Insert a product with zero quantity
        const sql = `
            INSERT INTO products (model, category, quantity, details, arrivalDate, sellingPrice) VALUES
            ("OutOfStockProduct", "Appliance", 0, "Out of stock product", "2020-12-12", 500);
        `;
        await runExec(sql);

        const model = 'OutOfStockProduct';

        // Make request to the route
        const response = await request(app)
            .post(routePath)
            .send({ model })
            .set("Cookie", customerCookie);

        // Assertions
        expect(response.status).toBe(409);
    });

});

describe("CartAPI_2: getCart method tests", () => {

    // Test for successful retrieval of cart
    test("CartAPI_2.1: It should return a 200 success code and the cart", async () => {
        // Make sure the customer has some products in their cart
        await request(app).post(routePath).send({ model: "iPhoneX" }).set("Cookie", customerCookie);

        // Make a GET request to retrieve the cart
        const response = await request(app).get(routePath + "/").set("Cookie", customerCookie);

        // Assert that the response status is 200
        expect(response.status).toBe(200);

        // Assert that the response body contains the cart with the added product
        expect(response.body.products).toEqual(expect.arrayContaining([
            expect.objectContaining({ model: "iPhoneX" })
        ]));
    });

    // Test for successful retrieval of empty cart
    test("CartAPI_2.2: It should return a 200 success code and an empty cart if no unpaid cart or unpaid cart with no products", async () => {

        // Make a GET request to retrieve the cart
        const response = await request(app).get(routePath + "/").set("Cookie", customerCookie);

        // Assert that the response status is 200
        expect(response.status).toBe(200);

        // Assert that the response body equals an empty cart
        expect(response.body.products).toEqual([]);
    });

});

describe("CartAPI_3: checkoutCart method tests", () => {

    test("CartAPI_3.1: It should simulate payment and return 200 success code", async () => {
        // Aggiungi alcuni prodotti al carrello dell'utente cliente
        await request(app).post(routePath).send({ model: "iPhoneX" }).set("Cookie", customerCookie);

        // Simula il pagamento
        const response = await request(app).patch(routePath).set("Cookie", customerCookie);

        // Asserzioni
        expect(response.status).toBe(200);

        // Verifica che il carrello sia stato pagato e che la data del pagamento sia impostata correttamente
        const sql = `
            SELECT paid, paymentDate
            FROM carts
            WHERE customer = ?;
        `;
        db.get(sql, [custInfo.username], (err: Error | null, row: any) => {
            expect(row.paid).toBe(1);
            const today = new Date().toISOString().split('T')[0];
            expect(row.paymentDate).toBe(today);
        });

        // Verifica che la quantità disponibile dei prodotti nel carrello sia stata ridotta correttamente
        const productSql = `
            SELECT quantity
            FROM products
            WHERE model = ?;
        `;
        db.get(productSql, ["iPhoneX"], (err: Error | null, row: any) => {
            expect(row.quantity).toBe(9); // Assumendo che la quantità iniziale fosse 10
        });
    });

    test("CartAPI_3.2: It should return 404 if there is no information about an unpaid cart in the database", async () => {

        // Tenta di eseguire il checkout di un carrello non esistente
        const response = await request(app).patch(routePath).set("Cookie", customerCookie);

        // Asserzioni
        expect(response.status).toBe(404);
    });

    test("CartAPI_3.3: It should return 400 if the cart contains no products", async () => {

        await request(app).post(routePath).send({ model: "iPhoneX" }).set("Cookie", customerCookie);

        //svuota carrello
        await runExec("DELETE FROM productInCart");

        // Tenta di eseguire il checkout del carrello vuoto
        const response = await request(app).patch(routePath).set("Cookie", customerCookie);

        expect(response.status).toBe(400);
    });

    test("CartAPI_3.4: It should return 409 if there is at least one product in the cart whose available quantity in the stock is 0", async () => {
        // Inserisci un prodotto con quantità 0
        const sql = `
            INSERT INTO products (model, category, quantity, details, arrivalDate, sellingPrice) VALUES
            ("OutOfStockProduct", "Appliance", 0, "Out of stock product", "2020-12-12", 500);
        `;
        await runExec(sql);

        // Aggiungi il prodotto esaurito al carrello dell'utente cliente
        await request(app).post(routePath).send({ model: "OutOfStockProduct" }).set("Cookie", customerCookie);

        // Tenta di eseguire il checkout del carrello con il prodotto esaurito
        const response = await request(app).patch(routePath).set("Cookie", customerCookie);

        // Asserzioni
        expect(response.status).toBe(409);
    });

    test("CartAPI_3.5: It should return 409 if there is at least one product in the cart whose quantity is higher than the available quantity in the stock", async () => {
        // Inserisci un prodotto con quantità 1
        const sql = `
            INSERT INTO products (model, category, quantity, details, arrivalDate, sellingPrice) VALUES
            ("LimitedStockProduct", "Appliance", 1, "Limited stock product", "2020-12-12", 500);
        `;
        await runExec(sql);

        // Aggiungi il prodotto con quantità superiore a quella disponibile al carrello dell'utente cliente
        await request(app).post(routePath).send({ model: "LimitedStockProduct" }).set("Cookie", customerCookie);
        await request(app).post(routePath).send({ model: "LimitedStockProduct" }).set("Cookie", customerCookie);

        // Tenta di eseguire il checkout del carrello con quantità superiore a quella disponibile
        const response = await request(app).patch(routePath).set("Cookie", customerCookie);

        // Asserzioni
        expect(response.status).toBe(409);
    });

});

describe("CartRoutes_4: getCartHistory method tests", () => {
    // Sample data for cart history
    const cartHistory = [
        { customer: "customer", paid: true, paymentDate: "2023-01-01", products: [{ model: "product1", category: "category1", quantity: 1, price: 50 }] },
        { customer: "customer", paid: true, paymentDate: "2023-02-01", products: [{ model: "product2", category: "category2", quantity: 1, price: 75 }] }
    ];

    test("CartRoutes_4.1: It should return a 200 success code and the cart history for a logged-in customer", async () => {
        // Log in as customer
        const customerResponse = await request(app)
            .post('/ezelectronics/sessions')
            .send(custInfo)
            .expect(200);

        const customerCookie = customerResponse.header["set-cookie"][0];

        // Pre-populate the database with sample cart history for testing
        const sql = `
            INSERT INTO products (model, quantity, category, sellingPrice) VALUES
            ('product1', 5, 'category1', 50),
            ('product2', 6, 'category2', 75);
            INSERT INTO carts (customer, paid, paymentDate) VALUES
            ('customer', 1, '2023-01-01'),
            ('customer', 1, '2023-02-01');
            INSERT INTO productInCart (modelProduct, idCart, quantityInCart) VALUES
            ('product1', 1, 1),
            ('product2', 2, 1);
        `;
        await runExec(sql);

        // Make a GET request to retrieve cart history
        const response = await request(app).get(routePath + "/history").set("Cookie", customerCookie);

        // Asserzioni
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.arrayContaining(cartHistory));
    });

    test("CartRoutes_4.2: It should return a 200 success code and an empty array if no cart history exists", async () => {
        // Log in as customer
        const customerResponse = await request(app)
            .post('/ezelectronics/sessions')
            .send(custInfo)
            .expect(200);

        const customerCookie = customerResponse.header["set-cookie"][0];

        // Ensure there are no paid carts in the database
        await runExec('DELETE FROM carts WHERE paid = 1');

        // Make a GET request to retrieve cart history
        const response = await request(app).get(routePath + "/history").set("Cookie", customerCookie);

        // Asserzioni
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    test("CartRoutes_4.3: It should return a 401 if the user is not logged in", async () => {
        // Tenta di ottenere la cronologia dei carrelli senza essere loggato
        const response = await request(app).get(routePath + "/history");

        // Asserzioni
        expect(response.status).toBe(401);
    });

    test("CartRoutes_4.4: It should return a 401 if the user is not a customer", async () => {
        // Log in as admin
        const adminResponse = await request(app)
            .post('/ezelectronics/sessions')
            .send(adminInfo)
            .expect(200);

        const adminCookie = adminResponse.header["set-cookie"][0];

        // Tenta di ottenere la cronologia dei carrelli come admin
        const response = await request(app)
            .get(routePath + "/history")
            .set("Cookie", adminCookie);

        // Asserzioni
        expect(response.status).toBe(401);
    });

});



describe("CartAPI_5: removeProductFromCart method tests", () => {

    test("CartAPI_5.1: It should return a 200 success code if the product was removed from the cart", async () => {
        const model = "iPhoneX";

        // Aggiungi il prodotto al carrello dell'utente cliente
        await request(app).post(routePath).send({ model }).set("Cookie", customerCookie);

        // Rimuovi il prodotto dal carrello
        const response = await request(app).delete(`${routePath}/products/${model}`).set("Cookie", customerCookie);

        // Asserzioni
        expect(response.status).toBe(200);

        // Verifica che il prodotto sia stato rimosso dal carrello
        const sql = `
            SELECT COUNT(*) as count
            FROM productInCart
            WHERE modelProduct = ? AND idCart IN (SELECT id FROM carts WHERE customer = ? AND paid = 0);
        `;
        db.get(sql, [model, custInfo.username], (err: Error | null, row: any) => {
            expect(row.count).toBe(0);
        });
    });

    test("CartAPI_5.2: It should return a 401 if the user is not logged in", async () => {
        const model = "iPhoneX";

        // Tenta di rimuovere un prodotto dal carrello senza essere loggato
        const response = await request(app).delete(`${routePath}/products/${model}`);

        // Asserzioni
        expect(response.status).toBe(401);
    });

    test("CartAPI_5.3: It should return a 401 if the user is not a customer", async () => {
        const model = "iPhoneX";

        // Log in as admin
        const adminResponse = await request(app)
            .post('/ezelectronics/sessions')
            .send(adminInfo)
            .expect(200);

        const adminCookie = adminResponse.header["set-cookie"][0];

        // Tenta di rimuovere un prodotto dal carrello come admin
        const response = await request(app)
            .delete(`${routePath}/products/${model}`)
            .set("Cookie", adminCookie);

        // Asserzioni
        expect(response.status).toBe(401);
    });

    test("CartAPI_5.4: It should return a 404 if the model is an empty string", async () => {
        // Tenta di rimuovere un prodotto con un modello vuoto
        const response = await request(app).delete(`${routePath}/products/`).set("Cookie", customerCookie);

        // Asserzioni
        expect(response.status).toBe(404);
    });

    test("CartAPI_5.5: It should return a 404 if the product does not exist in the cart", async () => {
        const model = "nonExistingModel";

        // Tenta di rimuovere un prodotto non esistente nel carrello
        const response = await request(app).delete(`${routePath}/products/${model}`).set("Cookie", customerCookie);

        // Asserzioni
        expect(response.status).toBe(404);
    });

    test("CartAPI_5.6: It should return a 404 if there is no unpaid cart or if the cart has no products", async () => {
        const model = "iPhoneX";

        // Tenta di rimuovere un prodotto dal carrello vuoto
        const response = await request(app).delete(`${routePath}/products/${model}`).set("Cookie", customerCookie);

        // Asserzioni
        expect(response.status).toBe(404);
    });

    test("CartAPI_5.7: It should return a 404 if model does not represent an existing product", async () => {
        const model = "nonExistingProductModel";

        // Tenta di rimuovere un prodotto che non esiste
        const response = await request(app).delete(`${routePath}/products/${model}`).set("Cookie", customerCookie);

        // Asserzioni
        expect(response.status).toBe(404);
    });

});


describe("CartAPI_6: clearCart method tests", () => {

    test("CartAPI_6.1: It should return a 200 success code if the products were removed from the cart", async () => {
        // Aggiungi un prodotto al carrello dell'utente cliente
        await request(app).post(routePath).send({ model: "iPhoneX" }).set("Cookie", customerCookie);

        // Svuota il carrello
        const response = await request(app).delete(`${routePath}/current`).set("Cookie", customerCookie);

        // Asserzioni
        expect(response.status).toBe(200);

        // Verifica che tutti i prodotti siano stati rimossi dal carrello e che il costo totale sia 0
        const sql = `
            SELECT 
                COALESCE(SUM(productInCart.quantityInCart * products.sellingPrice), 0) as totalCost,
                COUNT(productInCart.modelProduct) as count
            FROM carts
            LEFT JOIN productInCart ON carts.id = productInCart.idCart
            LEFT JOIN products ON productInCart.modelProduct = products.model
            WHERE carts.customer = ? AND carts.paid = false;
        `;
        db.get(sql, [custInfo.username], (err: Error | null, row: any) => {
            if (err) {
                throw err;
            }
            expect(row.totalCost).toBe(0);
            expect(row.count).toBe(0);
        });
    });


    test("CartAPI_6.2: It should return a 401 if the user is not logged in", async () => {
        // Tenta di svuotare il carrello senza essere loggato
        const response = await request(app).delete(`${routePath}/current`);

        // Asserzioni
        expect(response.status).toBe(401);
    });

    test("CartAPI_6.3: It should return a 401 if the user is not a customer", async () => {
        // Log in as admin
        const adminResponse = await request(app)
            .post('/ezelectronics/sessions')
            .send(adminInfo)
            .expect(200);

        const adminCookie = adminResponse.header["set-cookie"][0];

        // Tenta di svuotare il carrello come admin
        const response = await request(app)
            .delete(`${routePath}/current`)
            .set("Cookie", adminCookie);

        // Asserzioni
        expect(response.status).toBe(401);
    });

    test("CartAPI_6.4: It should return a 404 if there is no unpaid cart for the user", async () => {
        // Assicurati che il carrello dell'utente sia vuoto o pagato
        await request(app).post(`${routePath}/clear`).set("Cookie", customerCookie);

        // Tenta di svuotare un carrello non esistente
        const response = await request(app).delete(`${routePath}/current`).set("Cookie", customerCookie);

        expect(response.status).toBe(404);
    });
});


describe("CartRoutes_7: deleteAllCarts method tests", () => {

    test("CartRoutes_7.1: It should return a 200 success code if all carts were deleted by an admin", async () => {
        // Log in as admin
        const adminResponse = await request(app)
            .post('/ezelectronics/sessions')
            .send(adminInfo)
            .expect(200);

        const adminCookie = adminResponse.header["set-cookie"][0];

        // Aggiungi un prodotto al carrello dell'utente cliente per testare la rimozione
        await request(app).post(routePath).send({ model: "iPhoneX" }).set("Cookie", customerCookie);

        // Delete all carts as admin
        const response = await request(app)
            .delete(routePath)
            .set("Cookie", adminCookie);

        // Asserzioni
        expect(response.status).toBe(200);

        // Verifica che tutti i carrelli siano stati rimossi
        const sql = `
            SELECT COUNT(*) as count
            FROM carts;
        `;
        db.get(sql, [], (err: Error | null, row: any) => {
            if (err) {
                throw err;
            }
            expect(row.count).toBe(0);
        });
    });

    test("CartRoutes_7.2: It should return a 200 success code if all carts were deleted by a manager", async () => {
        // Log in as manager
        const managerResponse = await request(app)
            .post('/ezelectronics/sessions')
            .send({ username: manager.username, password: manager.password })
            .expect(200);

        const managerCookie = managerResponse.header["set-cookie"][0];

        // Aggiungi un prodotto al carrello dell'utente cliente per testare la rimozione
        await request(app).post(routePath).send({ model: "iPhoneX" }).set("Cookie", customerCookie);

        // Delete all carts as manager
        const response = await request(app)
            .delete(routePath)
            .set("Cookie", managerCookie);

        // Asserzioni
        expect(response.status).toBe(200);

        // Verifica che tutti i carrelli siano stati rimossi
        const sql = `
            SELECT COUNT(*) as count
            FROM carts;
        `;
        db.get(sql, [], (err: Error | null, row: any) => {
            if (err) {
                throw err;
            }
            expect(row.count).toBe(0);
        });
    });

    test("CartRoutes_7.3: It should return a 401 if the user is not logged in", async () => {
        // Tenta di cancellare tutti i carrelli senza essere loggato
        const response = await request(app).delete(routePath);

        // Asserzioni
        expect(response.status).toBe(401);
    });

    test("CartRoutes_7.4: It should return a 401 if the user is not an admin or manager", async () => {
        // Log in as customer
        const customerResponse = await request(app)
            .post('/ezelectronics/sessions')
            .send({ username: customer.username, password: customer.password })
            .expect(200);

        const customerCookie = customerResponse.header["set-cookie"][0];

        // Tenta di cancellare tutti i carrelli come cliente
        const response = await request(app)
            .delete(routePath)
            .set("Cookie", customerCookie);

        // Asserzioni
        expect(response.status).toBe(401);
    });

});

describe("CartRoutes_8: getAllCarts method tests", () => {

    // Sample data for all carts
    const allCarts = [
        { customer: "customer", paid: true, paymentDate: "2023-01-01", products: [{ model: "product1", category: "category1", quantity: 1, price: 50 }] },
        { customer: "customer", paid: false, paymentDate: "", products: [{ model: "product2", category: "category2", quantity: 1, price: 75 }] }
    ];

    test("CartRoutes_8.1: It should return a 200 success code and all carts for a logged-in admin", async () => {
        // Log in as admin
        const adminResponse = await request(app)
            .post('/ezelectronics/sessions')
            .send(adminInfo)
            .expect(200);

        const adminCookie = adminResponse.header["set-cookie"][0];

        // Pre-populate the database with sample carts for testing
        const sql = `
            INSERT INTO carts (customer, paid, paymentDate) VALUES
            ('customer', 1, '2023-01-01'),
            ('customer', 0, '');
            INSERT INTO products (model, quantity, category, sellingPrice) VALUES
            ('product1', 3, 'category1', 50),
            ('product2', 4, 'category2', 75);
            INSERT INTO productInCart (modelProduct, idCart, quantityInCart) VALUES
            ('product1', 1, 1),
            ('product2', 2, 1);
        `;
        await runExec(sql);

        // Make a GET request to retrieve all carts
        const response = await request(app).get(routePath + "/all").set("Cookie", adminCookie);

        // Asserzioni
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.arrayContaining(allCarts));
    });

    test("CartRoutes_8.2: It should return a 200 success code and an empty array if no carts exist", async () => {
        // Log in as admin
        const adminResponse = await request(app)
            .post('/ezelectronics/sessions')
            .send(adminInfo)
            .expect(200);

        const adminCookie = adminResponse.header["set-cookie"][0];

        // Ensure there are no carts in the database
        await runExec('DELETE FROM carts');

        // Make a GET request to retrieve all carts
        const response = await request(app).get(routePath + "/all").set("Cookie", adminCookie);

        // Asserzioni
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    test("CartRoutes_8.3: It should return a 401 if the user is not logged in", async () => {
        // Tenta di ottenere tutti i carrelli senza essere loggato
        const response = await request(app).get(routePath + "/all");

        // Asserzioni
        expect(response.status).toBe(401);
    });

    test("CartRoutes_8.4: It should return a 401 if the user is not an admin or manager", async () => {
        // Log in as customer
        const customerResponse = await request(app)
            .post('/ezelectronics/sessions')
            .send(custInfo)
            .expect(200);

        const customerCookie = customerResponse.header["set-cookie"][0];

        // Tenta di ottenere tutti i carrelli come cliente
        const response = await request(app)
            .get(routePath + "/all")
            .set("Cookie", customerCookie);

        // Asserzioni
        expect(response.status).toBe(401);
    });

});
