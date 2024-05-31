import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals";
import ReviewDAO from "../../src/dao/reviewDAO";
import { Role, User } from "../../src/components/user";
import { ProductReview } from "../../src/components/review";
import db from "../../src/db/db";
import { Database } from "sqlite3";

jest.mock("../../src/db/db.ts");
jest.mock("../../src/components/review.ts");


describe("ReviewDAO_1: addReview method tests", () => {
    test("ReviewDAO_1.1: It should return nothing", async () => {
        const model = "iPhoneX";
        const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const score = 2;
        const comment = "commento di test";
        const reviewDAO = new ReviewDAO();
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((_sql, _params, callback: (err: Error | null, row: any) => void) => {
            callback(null, {model: model});
            return {} as Database
        }).mockImplementationOnce((_sql, _params, callback: (err: Error | null, row: any) => void) => {
            callback(null, null);
            return {} as Database
        });
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        const result = await reviewDAO.addReview(model, user, score, comment);
        expect(result).toBe(undefined);
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
});

describe("ReviewDAO_2: getProductReviews method tests", () => {
    test("ReviewDAO_2.1: It should return ProductReview[]", async () => {
        const reviews: ProductReview[] = [];
        const model = "iPhoneX";
        reviews.push(new ProductReview(model,"us1", 2, "test", "test"));
        const reviewDAO = new ReviewDAO();
        const mockDBAll = jest.spyOn(db, "all").mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, rows: any) => void) => {
            callback(null, reviews);
            return {} as Database
        });
        const result = await reviewDAO.getProductReviews(model);
        expect(mockDBAll).toHaveBeenCalledTimes(1);
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(ProductReview);
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
});

describe("ReviewDAO_3: deleteReview method tests", () => {
    test("ReviewDAO_3.1: It should return nothing", async () => {
        const model = "iPhoneX";
        const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const reviewDAO = new ReviewDAO();
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((_sql, _params, callback: (err: Error | null, row: any) => void) => {
            callback(null, {model: model});
            return {} as Database
        }).mockImplementationOnce((_sql, _params, callback: (err: Error | null, row: any) => void) => {
            callback(null, null);
            return {} as Database
        });
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        const result = await reviewDAO.deleteReview(model, user);
        expect(result).toBe(undefined);
        mockDBRun.mockRestore();
    });
});

describe("ReviewDAO_4: deleteReviewsOfProduct method tests", () => {
    test("ReviewDAO_4.1: It should return nothing", async () => {
        const model = "iPhoneX";
        const reviewDAO = new ReviewDAO();
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((_sql, _params, callback: (err: Error | null, row: any) => void) => {
            callback(null, {model: model});
            return {} as Database
        });
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        const result = await reviewDAO.deleteReviewsOfProduct(model);
        expect(result).toBe(undefined);
        mockDBRun.mockRestore();
    });
});

describe("ReviewDAO_5: deleteAllReviews method tests", () => {
    test("ReviewDAO_5.1: It should return nothing", async () => {
        const reviewDAO = new ReviewDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(null)
            return {} as Database
        });
        const result = await reviewDAO.deleteAllReviews();
        expect(result).toBe(undefined);
        mockDBRun.mockRestore();
    });
});