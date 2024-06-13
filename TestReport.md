# Test Report

<The goal of this document is to explain how the application was tested, detailing how the test cases were defined and what they cover>

# Contents

- [Test Report](#test-report)
- [Contents](#contents)
- [Dependency graph](#dependency-graph)
- [Integration approach](#integration-approach)
- [Tests](#tests)
- [Coverage](#coverage)
  - [Coverage of FR](#coverage-of-fr)
  - [Coverage white box](#coverage-white-box)

# Dependency graph

![dependencyGraph](./img/dependencyGraph.png)

# Integration approach

    <Write here the integration sequence you adopted, in general terms (top down, bottom up, mixed) and as sequence

    (ex: step1: unit A, step 2: unit A+B, step 3: unit A+B+C, etc)>

    <Some steps may  correspond to unit testing (ex step1 in ex above)>

    <One step will  correspond to API testing, or testing unit route.js>

Abbiamo sviluppato gli integration test in maniera Top Down

# Tests

<in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case (BB/ eq partitioning, BB/ boundary, WB/ statement coverage, etc)> <split the table if needed>

| Test case name             | Object(s) tested                       | Test level   | Technique used |
| :------------------------: | :------------------------------------: | :----------: | :------------: |
|   CartDAO                  |                                        |              |                |
|   CartDAO_1                | addToCart method                       |  unit        |  WB            |
|   CartDAO_2                | getCart method                         |  unit        |  WB            |
|   CartDAO_3                | checkoutCart method                    |  unit        |  WB            |
|   CartDAO_4                | getCustomerCarts method                |  unit        |  WB            |
|   CartDAO_5                | removeProductFromCart method           |  unit        |  WB            |
|   CartDAO_6                | clearCart method                       |  unit        |  WB            |
|   CartDAO_7                | deleteAllCarts method                  |  unit        |  WB            |
|   CartDAO_8                | getAllCarts method                     |  unit        |  WB            |
|   CartController           |                                        |              |                |
|   CartController_1         | addToCart method                       |  unit        |  WB            |
|   CartController_2         | getCart method                         |  unit        |  WB            |
|   CartController_3         | checkoutCart method                    |  unit        |  WB            |
|   CartController_4         | getCustomerCarts method                |  unit        |  WB            |
|   CartController_5         | removeProductFromCart method           |  unit        |  WB            |
|   CartController_6         | clearCart method                       |  unit        |  WB            |
|   CartController_7         | deleteAllCarts method                  |  unit        |  WB            |
|   CartController_8         | getAllCarts method                     |  unit        |  WB            |
|   CartRoutes               |                                        |              |                |
|   CartRoutes_1             | route GET /carts                       |  unit        |  WB            |
|   CartRoutes_2             | route POST /carts                      |  unit        |  WB            |
|   CartRoutes_3             | route PATCH /carts                     |  unit        |  WB            |
|   CartRoutes_4             | route GET /carts/history               |  unit        |  WB            |
|   CartRoutes_5             | route DELETE /carts/products/:model    |  unit        |  WB            |
|   CartRoutes_6             | route DELETE /carts/current            |  unit        |  WB            |
|   CartRoutes_7             | route DELETE /carts                    |  unit        |  WB            |
|   CartRoutes_8             | route GET /carts/all                   |  unit        |  WB            |
|   CartAPI                  |                                        |              |                |
|   CartAPI_1                | route GET /carts                       |  API         |  BB            |
|   CartAPI_2                | route POST /carts                      |  API         |  BB            |
|   CartAPI_3                | route PATCH /carts                     |  API         |  BB            |
|   CartAPI_4                | route GET /carts/history               |  API         |  BB            |
|   CartAPI_5                | route DELETE /carts/products/:model    |  API         |  BB            |
|   CartAPI_6                | route DELETE /carts/current            |  API         |  BB            |
|   CartAPI_7                | route DELETE /carts                    |  API         |  BB            |
|   CartAPI_8                | route GET /carts/all                   |  API         |  BB            |
|                            |                                        |              |                |
|   ProductDAO               |                                        |              |                |
|   ProductDAO_1             | registerProducts method                |  unit        |  WB            |
|   ProductDAO_2             | changeProductQuantity method           |  unit        |  WB            |
|   ProductDAO_3             | getProducts method                     |  unit        |  WB            |
|   ProductDAO_4             | getAvailableProducts method            |  unit        |  WB            |
|   ProductDAO_5             | sellProduct method                     |  unit        |  WB            |
|   ProductDAO_6             | deleteAllProducts method               |  unit        |  WB            |
|   ProductDAO_7             | deleteProduct method                   |  unit        |  WB            |
|   ProductController        |                                        |              |                |
|   ProductController_1      | registerProducts method                |  unit        |  WB            |
|   ProductController_2      | changeProductQuantity method           |  unit        |  WB            |
|   ProductController_3      | getProducts method                     |  unit        |  WB            |
|   ProductController_4      | getAvailableProducts method            |  unit        |  WB            |
|   ProductController_5      | sellProduct method                     |  unit        |  WB            |
|   ProductController_6      | deleteAllProducts method               |  unit        |  WB            |
|   ProductController_7      | deleteProduct method                   |  unit        |  WB            |
|   ProductRoutes            |                                        |              |                |
|   ProductRoutes_1          | route POST /products                   |  unit        |  WB            |
|   ProductRoutes_2          | route PATCH /products/:model           |  unit        |  WB            |
|   ProductRoutes_3          | route PATCH /products/:model/sell      |  unit        |  WB            |
|   ProductRoutes_4          | route GET /products                    |  unit        |  WB            |
|   ProductRoutes_5          | route GET /products/available          |  unit        |  WB            |
|   ProductRoutes_6          | route DELETE /products/:model          |  unit        |  WB            |
|   ProductRoutes_7          | route DELETE /products                 |  unit        |  WB            |
|   ProductAPI               |                                        |              |                |
|   ProductAPI_1             | route POST /products                   |  API         |  BB            |
|   ProductAPI_2             | route PATCH /products/:model           |  API         |  BB            |
|   ProductAPI_3             | route PATCH /products/:model/sell      |  API         |  BB            |
|   ProductAPI_4             | route GET /products                    |  API         |  BB            |
|   ProductAPI_5             | route GET /products/available          |  API         |  BB            |
|   ProductAPI_6             | route DELETE /products/:model          |  API         |  BB            |
|   ProductAPI_7             | route DELETE /products                 |  API         |  BB            |
|                            |                                        |              |                |
|   ReviewDAO                |                                        |              |                |
|   ReviewDAO_1              | addReview method                       |  unit        |  WB            |
|   ReviewDAO_2              | getProductReviews method               |  unit        |  WB            |
|   ReviewDAO_3              | deleteReview method                    |  unit        |  WB            |
|   ReviewDAO_4              | deleteReviewsOfProduct method          |  unit        |  WB            |
|   ReviewDAO_5              | deleteAllReviews method                |  unit        |  WB            |
|   ReviewController         |                                        |              |                |
|   ReviewController_1       | addReview method                       |  unit        |  WB            |
|   ReviewController_2       | getProductReviews method               |  unit        |  WB            |
|   ReviewController_3       | deleteReview method                    |  unit        |  WB            |
|   ReviewController_4       | deleteReviewsOfProduct method          |  unit        |  WB            |
|   ReviewController_5       | deleteAllReviews method                |  unit        |  WB            |
|   ReviewRoutes             |                                        |              |                |
|   ReviewRoutes_1           | route POST /reviews/:model             |  unit        |  WB            |
|   ReviewRoutes_2           | route GET /reviews/:model              |  unit        |  WB            |
|   ReviewRoutes_3           | route DELETE /reviews/:model           |  unit        |  WB            |
|   ReviewRoutes_4           | route DELETE /reviews/:model/all       |  unit        |  WB            |
|   ReviewRoutes_5           | route DELETE /reviews                  |  unit        |  WB            |
|   ReviewAPI                |                                        |              |                |
|   ReviewAPI_1              | route POST /reviews/:model             |  API         |  BB            |
|   ReviewAPI_2              | route GET /reviews/:model              |  API         |  BB            |
|   ReviewAPI_3              | route DELETE /reviews/:model           |  API         |  BB            |
|   ReviewAPI_4              | route DELETE /reviews/:model/all       |  API         |  BB            |
|   ReviewAPI_5              | route DELETE /reviews                  |  API         |  BB            |
|                            |                                        |              |                |
|   UserDAO                  |                                        |              |                |
|   UserDAO_1                | getIsUserAuthenticated method          |  unit        |  WB            |
|   UserDAO_2                | createUser method                      |  unit        |  WB            |
|   UserDAO_3                | getUserByUsername method               |  unit        |  WB            |
|   UserDAO_4                | getAllUsers method                     |  unit        |  WB            |
|   UserDAO_5                | deleteAll method                       |  unit        |  WB            |
|   UserDAO_6                | getUsersByRole method                  |  unit        |  WB            |
|   UserDAO_7                | updateUserInfo method                  |  unit        |  WB            |
|   UserDAO_8                | deleteUser method                      |  unit        |  WB            |
|   UserController           |                                        |              |                |
|   UserController_1         | getIsUserAuthenticated method          |  unit        |  WB            |
|   UserController_2         | createUser method                      |  unit        |  WB            |
|   UserController_3         | getUserByUsername method               |  unit        |  WB            |
|   UserController_4         | getAllUsers method                     |  unit        |  WB            |
|   UserController_5         | deleteAll method                       |  unit        |  WB            |
|   UserController_6         | getUsersByRole method                  |  unit        |  WB            |
|   UserController_7         | updateUserInfo method                  |  unit        |  WB            |
|   UserController_8         | deleteUser method                      |  unit        |  WB            |
|   UserRoutes               |                                        |              |                |
|   UserRoutes_1             | route POST /users                      |  unit        |  WB            |
|   UserRoutes_2             | route GET /users                       |  unit        |  WB            |
|   UserRoutes_3             | route GET /users/roles/:role           |  unit        |  WB            |
|   UserRoutes_4             | route GET /users/:username             |  unit        |  WB            |
|   UserRoutes_5             | route DELETE /users/:username          |  unit        |  WB            |
|   UserRoutes_6             | route DELETE /users                    |  unit        |  WB            |
|   UserRoutes_7             | route PATCH /users/:username           |  unit        |  WB            |
|   UserAPI                  |                                        |              |                |
|   UserAPI_1                | route POST /users                      |  API         |  BB            |
|   UserAPI_2                | route GET /users                       |  API         |  BB            |
|   UserAPI_3                | route GET /users/roles/:role           |  API         |  BB            |
|   UserAPI_4                | route GET /users/:username             |  API         |  BB            |
|   UserAPI_5                | route DELETE /users/:username          |  API         |  BB            |
|   UserAPI_6                | route DELETE /users                    |  API         |  BB            |
|   UserAPI_7                | route PATCH /users/:username           |  API         |  BB            |

# Coverage

## Coverage of FR

<Report in the following table the coverage of functional requirements and scenarios(from official requirements) >

| Functional Requirement or scenario | Test(s)                                                           |
| :--------------------------------: | :---------------------------------------------------------------: |
|                FR1                 |                                                                   |
|               FR1.1                |                                                                   |
|               FR1.2                |                                                                   |
|               FR1.3                | UserDAO_2, UserController_2, UserRoutes_1, UserAPI_1              |
|                FR2                 |                                                                   |
|               FR2.1                | UserDAO_4, UserController_4, UserRoutes_2, UserAPI_2              |
|               FR2.2                | UserDAO_6, UserController_6, UserRoutes_3, UserAPI_3              |
|               FR2.3                | UserDAO_3, UserController_3, UserRoutes_4, UserAPI_4              |
|               FR2.4                | UserDAO_7, UserController_7, UserRoutes_7, UserAPI_7              |
|               FR2.5                | UserDAO_8, UserController_8, UserRoutes_5, UserAPI_5              |
|               FR2.6                | UserDAO_5, UserController_5, UserRoutes_6, UserAPI_6              |
|                FR3                 |                                                                   |
|               FR3.1                | ProductDAO_1, ProductController_1, ProductRoutes_1, ProductAPI_1  |
|               FR3.2                | ProductDAO_2, ProductController_2, ProductRoutes_2, ProductAPI_2  |
|               FR3.3                | ProductDAO_5, ProductController_5, ProductRoutes_3, ProductAPI_3  |
|               FR3.4                | ProductDAO_3, ProductController_3, ProductRoutes_4, ProductAPI_4  |
|              FR3.4.1               | ProductDAO_4, ProductController_4, ProductRoutes_5, ProductAPI_5  |
|               FR3.5                | ProductDAO_3, ProductController_3, ProductRoutes_4, ProductAPI_4  |
|              FR3.5.1               | ProductDAO_4, ProductController_4, ProductRoutes_5, ProductAPI_5  |
|               FR3.6                | ProductDAO_3, ProductController_3, ProductRoutes_4, ProductAPI_4  |
|              FR3.6.1               | ProductDAO_4, ProductController_4, ProductRoutes_5, ProductAPI_5  |
|               FR3.7                | ProductDAO_7, ProductController_7, ProductRoutes_6, ProductAPI_6  |
|               FR3.8                | ProductDAO_6, ProductController_6, ProductRoutes_7, ProductAPI_7  |
|                FR4                 |                                                                   |
|               FR4.1                | ReviewDAO_1, ReviewController_1, ReviewRoutes_1, ReviewAPI_1      |
|               FR4.2                | ReviewDAO_2, ReviewController_2, ReviewRoutes_2, ReviewAPI_2      |
|               FR4.3                | ReviewDAO_3, ReviewController_3, ReviewRoutes_3, ReviewAPI_3      |
|               FR4.4                | ReviewDAO_4, ReviewController_4, ReviewRoutes_4, ReviewAPI_4      |
|               FR4.5                | ReviewDAO_5, ReviewController_5, ReviewRoutes_5, ReviewAPI_5      |
|                FR5                 |                                                                   |
|               FR5.1                | CartDAO_2, CartController_2, CartRoutes_1, CartAPI_1              |
|               FR5.2                | CartDAO_1, CartController_1, CartRoutes_2, CartAPI_2              |
|               FR5.3                | CartDAO_3, CartController_3, CartRoutes_3, CartAPI_3              |
|               FR5.4                | CartDAO_4, CartController_4, CartRoutes_4, CartAPI_4              |
|               FR5.5                | CartDAO_5, CartController_5, CartRoutes_5, CartAPI_5              |
|               FR5.6                | CartDAO_6, CartController_6, CartRoutes_6, CartAPI_6              |
|               FR5.7                | CartDAO_7, CartController_7, CartRoutes_7, CartAPI_7              |
|               FR5.8                | CartDAO_8, CartController_8, CartRoutes_8, CartAPI_8              |

## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage

![coverage](./img/coverage.png)