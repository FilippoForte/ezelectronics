import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals";
import ReviewDAO from "../../src/dao/reviewDAO";
import { Role, User } from "../../src/components/user";
import { ProductReview } from "../../src/components/review";
import db from "../../src/db/db";
import { Database } from "sqlite3";

jest.mock("../../src/db/db.ts");
jest.mock("../../src/components/review.ts");


describe("ReviewDAO: addReview method tests", () => {
    test("It should return nothing", async () => {
        const model = "iPhoneX";
        const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const score = 2;
        const comment = "commento di test";
        const reviewDAO = new ReviewDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        const result = await reviewDAO.addReview(model, user, score, comment);
        expect(result).toBe(undefined);
        mockDBRun.mockRestore();
    });
});

describe("ReviewDAO: getProductReviews method tests", () => {
    /*
    test("It should return ProductReview[]", async () => {
        const reviews: ProductReview[] = [];
        const model = "iPhoneX";
        const reviewDAO = new ReviewDAO();
        const mockDBRun = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        const result = await reviewDAO.getProductReviews(model);
        expect(result).toBe(reviews);
        mockDBRun.mockRestore();
    });
    */
});

describe("ReviewDAO: deleteReview method tests", () => {
    test("It should return nothing", async () => {
        const model = "iPhoneX";
        const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const reviewDAO = new ReviewDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        const result = await reviewDAO.deleteReview(model, user);
        expect(result).toBe(undefined);
        mockDBRun.mockRestore();
    });
});

describe("ReviewDAO: deleteReviewsOfProduct method tests", () => {
    test("It should return nothing", async () => {
        const model = "iPhoneX";
        const reviewDAO = new ReviewDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        const result = await reviewDAO.deleteReviewsOfProduct(model);
        expect(result).toBe(undefined);
        mockDBRun.mockRestore();
    });
});

describe("ReviewDAO: deleteAllReviews method tests", () => {
    test("It should return nothing", async () => {
        const reviewDAO = new ReviewDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        const result = await reviewDAO.deleteAllReviews();
        expect(result).toBe(undefined);
        mockDBRun.mockRestore();
    });
});