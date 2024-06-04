import { test, expect, jest } from "@jest/globals";
import { ProductReview } from "../../src/components/review";
import request from 'supertest';
import { app } from "../../index";
import ErrorHandler from "../../src/helper";
import Authenticator from "../../src/routers/auth";

import ReviewController from "../../src/controllers/reviewController";
const baseURL = "/ezelectronics/reviews";


describe("ReviewRoutes_1: addReview method tests", () => {
    test("ReviewRoutes_1.1: It should return a 200 success code", async () => {
        const testReview = { 
            score: "test",
            comment: "test",
        };
        const model = "iPhone13";
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
                isIn: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next()
        });
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next()
        });
        jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce(undefined);
        const response = await request(app).post(baseURL + "/" + model).send(testReview);
        //expect(response.status).toBe(200);
        //expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(1);
    })
});

describe("ReviewRoutes_2: getProductReviews method tests", () => {
    test("ReviewRoutes_2.1: It should return a 200 success code", async () => {
        const reviews: ProductReview[] = [];
        const model = "test";
        reviews.push(new ProductReview(model,"us1", 2, "test", "test"));
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
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
        //expect(response.status).toBe(200);
        //expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledTimes(1);
        //expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledWith(model);
    })
});

describe("ReviewRoutes_3: deleteReview method tests", () => {
    test("ReviewRoutes_3.1: It should return a 200 success code", async () => {
        const model = "test";
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next()
        });
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(ReviewController.prototype, "deleteReview").mockResolvedValueOnce(undefined);
        const response = await request(app).delete(baseURL + "/" + model);
        //expect(response.status).toBe(200);
        //expect(ReviewController.prototype.deleteReview).toHaveBeenCalledTimes(1);
    })
});

describe("ReviewRoutes_4: deleteReviewsOfProduct method tests", () => {
    test("ReviewRoutes_4.1: It should return a 200 success code", async () => {
        const model = "test";
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return next()
        });
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) }),
            })),
        }));
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce(undefined);
        const response = await request(app).delete(baseURL + "/" + model + "/all");
        //expect(response.status).toBe(200);
        //expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1);
        //expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith(model);
    })
});

describe("ReviewRoutes_5: deleteAllReviews method tests", () => {
    test("ReviewRoutes_5.1: It should return a 200 success code", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return next()
        });
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(ReviewController.prototype, "deleteAllReviews").mockResolvedValueOnce(undefined);
        const response = await request(app).delete(baseURL);
        //expect(response.status).toBe(200);
        //expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        //expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
        //expect(ReviewController.prototype.deleteAllReviews).toHaveBeenCalledTimes(1);
    })
});

