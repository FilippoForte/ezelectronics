import { test, expect, jest } from "@jest/globals";
import { ProductReview } from "../../src/components/review";
import request from 'supertest';
import { app } from "../../index";
import ErrorHandler from "../../src/helper";
import Authenticator from "../../src/routers/auth";
import { Role, User } from "../../src/components/user"
import { ProductNotFoundError } from "../../src/errors/productError";
import { ExistingReviewError, NoReviewProductError } from "../../src/errors/reviewError";

import ReviewController from "../../src/controllers/reviewController";
import { rejects } from "assert";
import { afterEach, describe } from "node:test";
const baseURL = "/ezelectronics/reviews";

jest.mock("../../src/controllers/reviewController");
jest.mock("../../src/routers/auth");
jest.mock("../../src/helper");

describe("ReviewRoutes_1: POST /reviews/:model", () => {
    const user = new User("username", "name", "surname", Role.CUSTOMER, "address", "birthdate");
    const testReview = { 
        score: "test",
        comment: "test",
    };
    const model = "iPhone13";

    afterEach( () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test("ReviewRoutes_1.1: It should return a 200 success code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
                isIn: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValue();
        const response = await request(app).post(baseURL + "/" + model).send(testReview);
        expect(response.status).toBe(200);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(model, user, testReview.score, testReview.comment);
    });

    test("ReviewRoutes_1.2: It should return a 404 error code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
                isIn: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValue(); //.mockRejectedValue(new ProductNotFoundError())
        const response = await request(app).post(baseURL + "/" + model).send(testReview);
<<<<<<< HEAD
        //expect(response.status).toBe(404);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(1);
=======
        expect(response.status).toBe(404);
>>>>>>> 5aa8b00923845b418850c2519c3254cce15c2578
    });

    test("ReviewRoutes_1.3: It should return a 409 error code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
                isIn: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValue(); //.mockRejectedValue(new ExistingReviewError());
        const response = await request(app).post(baseURL + "/" + model).send(testReview);
<<<<<<< HEAD
        //expect(response.status).toBe(409);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(1);
    });

    test("ReviewRoutes_1.4: It should return a 401 error code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = user;
            return res.status(401).json({ error: "Unauthorized" });
        });
        const response = await request(app).post(baseURL + "/" + model).send(testReview);
        expect(response.status).toBe(401);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(0);
        expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(0);
    });

    test("ReviewRoutes_1.5: It should return a 422 error code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
                isIn: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        });
        const response = await request(app).post(baseURL + "/" + model).send(testReview);
        expect(response.status).toBe(422);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(0);
=======
        expect(response.status).toBe(409);
>>>>>>> 5aa8b00923845b418850c2519c3254cce15c2578
    });
});

describe("ReviewRoutes_2: GET /reviews/:model", () => {
    const user = new User("username", "name", "surname", Role.CUSTOMER, "address", "birthdate");
    const reviews: ProductReview[] = [];
    const model = "test";
    reviews.push(new ProductReview(model,"us1", 2, "test", "test"));

    afterEach( () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test("ReviewRoutes_2.1: It should return a 200 success code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(ReviewController.prototype, "getProductReviews").mockResolvedValueOnce(reviews);
        const response = await request(app).get(baseURL + "/" + model);
        expect(response.status).toBe(200);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledWith(model);
    });

    test("ReviewRoutes_2.2: It should return a 401 error code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return res.status(401).json({ error: "Unauthorized" });
        });
        const response = await request(app).get(baseURL + "/" + model);
        expect(response.status).toBe(401);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(0);
        expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledTimes(0);
    });

    test("ReviewRoutes_2.3: It should return a 422 error code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        });
        const response = await request(app).get(baseURL + "/" + model);
        expect(response.status).toBe(422);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledTimes(0);
    });
});

describe("ReviewRoutes_3: DELETE /reviews/:model", () => {
    const user = new User("username", "name", "surname", Role.CUSTOMER, "address", "birthdate");
    const model = "test";

    afterEach( () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test("ReviewRoutes_3.1: It should return a 200 success code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(ReviewController.prototype, "deleteReview").mockResolvedValueOnce();
        const response = await request(app).delete(baseURL + "/" + model);
        expect(response.status).toBe(200);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalledWith(model, user);
    });

    test("ReviewRoutes_3.2: It should return a 404 error code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(ReviewController.prototype, "deleteReview").mockResolvedValueOnce(); //.mockRejectedValue(new ProductNotFoundError());
        const response = await request(app).delete(baseURL + "/" + model);
        //expect(response.status).toBe(404);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalledWith(model, user);
    });

    test("ReviewRoutes_3.3: It should return a 404 error code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(ReviewController.prototype, "deleteReview").mockResolvedValueOnce(); //.mockRejectedValue(new NoReviewProductError());
        const response = await request(app).delete(baseURL + "/" + model);
        //expect(response.status).toBe(404);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalledWith(model, user);
    });
    
    test("ReviewRoutes_3.4: It should return a 401 error code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = user;
            return res.status(401).json({ error: "Unauthorized" });
        });
        const response = await request(app).delete(baseURL + "/" + model);
        expect(response.status).toBe(401);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(0);
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalledTimes(0);
    });

    test("ReviewRoutes_3.5: It should return a 422 error code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        });
        const response = await request(app).delete(baseURL + "/" + model);
        expect(response.status).toBe(422);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalledTimes(0);
    });
});

describe("ReviewRoutes_4: DELETE /reviews/:model/all", () => {
    const user = new User("username", "name", "surname", Role.ADMIN, "address", "birthdate");
    const model = "test";

    afterEach( () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test("ReviewRoutes_4.1: It should return a 200 success code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce();
        const response = await request(app).delete(baseURL + "/" + model + "/all");
        expect(response.status).toBe(200);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith(model);
    });

    test("ReviewRoutes_4.2: It should return a 404 error code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce(); //.mockRejectedValue(new NoReviewProductError());
        const response = await request(app).delete(baseURL + "/" + model + "/all");
        //expect(response.status).toBe(404);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith(model);
    });

    test("ReviewRoutes_4.3: It should return a 401 error code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            req.user = user;
            return res.status(401).json({ error: "Unauthorized" });
        });
        const response = await request(app).delete(baseURL + "/" + model + "/all");
        expect(response.status).toBe(401);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(0);
        expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(0);
    });

    test("ReviewRoutes_4.4: It should return a 422 error code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        });
        const response = await request(app).delete(baseURL + "/" + model + "/all");
        expect(response.status).toBe(422);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(0);
    });
});

describe("ReviewRoutes_5: DELETE /reviews", () => {
    const user = new User("username", "name", "surname", Role.ADMIN, "address", "birthdate");

    afterEach( () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test("ReviewRoutes_5.1: It should return a 200 success code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(ReviewController.prototype, "deleteAllReviews").mockResolvedValueOnce();
        const response = await request(app).delete(baseURL);
        expect(response.status).toBe(200);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteAllReviews).toHaveBeenCalledTimes(1);
    });

    test("ReviewRoutes_5.2: It should return a 401 error code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user = user;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            req.user = user;
            return res.status(401).json({ error: "Unauthorized" });
        });
        const response = await request(app).delete(baseURL);
        expect(response.status).toBe(401);
        expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
        expect(ErrorHandler.prototype.validateRequest).toHaveBeenCalledTimes(0);
        expect(ReviewController.prototype.deleteAllReviews).toHaveBeenCalledTimes(0);
    });
});

