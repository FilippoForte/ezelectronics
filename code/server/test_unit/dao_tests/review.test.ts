import { test, expect, jest } from "@jest/globals";
import ReviewDAO from "../../src/dao/reviewDAO";
import { Role, User } from "../../src/components/user";
import { ProductReview } from "../../src/components/review";
import db from "../../src/db/db";
import { Database } from "sqlite3";
import { ProductNotFoundError } from "../../src/errors/productError";
import { ExistingReviewError, NoReviewProductError } from "../../src/errors/reviewError";

jest.mock("../../src/db/db.ts");
jest.mock("../../src/components/review.ts");


describe("ReviewDAO_1: addReview method tests", () => {
    let mockDBGet: any;
    let mockDBRun: any;
    const model = "iPhoneX";
    const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
    const score = 2;
    const comment = "commento di test";

    beforeEach(async () => {
        mockDBGet = jest.spyOn(db, "get");
        mockDBRun = jest.spyOn(db, "run");
    });

    afterEach( () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    
    test("ReviewDAO_1.1: It should return nothing", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, {model: model});
            return {} as Database
        }).mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, null);
            return {} as Database
        });
        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: any) => {
            callback(null)
            return {} as Database
        });
        const result = await reviewDAO.addReview(model, user, score, comment);
        expect(result).toBe(undefined);
        expect(mockDBGet).toHaveBeenCalledTimes(2);
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });

    test("ReviewDAO_1.2: It should return ProductNotFoundError", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, undefined);
            return {} as Database
        });
        await expect(reviewDAO.addReview(model, user, score, comment)).rejects.toThrow(ProductNotFoundError);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });

    test("ReviewDAO_1.3: It should return ExistingReviewError", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, {model: model});
            return {} as Database
        }).mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, {id: 1});
            return {} as Database
        });
        await expect(reviewDAO.addReview(model, user, score, comment)).rejects.toThrow(ExistingReviewError);
        expect(mockDBGet).toHaveBeenCalledTimes(2);
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });

    test("ReviewDAO_1.4: It should return an SQL error", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(new Error(), undefined);
            return {} as Database
        });
        await expect(reviewDAO.addReview(model, user, score, comment)).rejects.toThrow(Error);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });
});

describe("ReviewDAO_2: getProductReviews method tests", () => {
    let mockDBAll: any;
    const reviews: ProductReview[] = [];
    const model = "iPhoneX";
    reviews.push(new ProductReview(model,"us1", 2, "test", "test"));

    beforeEach(async () => {
        mockDBAll = jest.spyOn(db, "all");
    });

    afterEach( () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test("ReviewDAO_2.1: It should return an array of ProductReview[]", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, rows: any) => void) => {
            callback(null, reviews);
            return {} as Database
        });
        const result = await reviewDAO.getProductReviews(model);
        expect(mockDBAll).toHaveBeenCalledTimes(1);
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(ProductReview);
    });

    test("ReviewDAO_2.2: It should return an empty array of ProductReview[]", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, rows: any) => void) => {
            callback(null, []);
            return {} as Database
        });
        const result = await reviewDAO.getProductReviews(model);
        expect(mockDBAll).toHaveBeenCalledTimes(1);
        expect(result).toHaveLength(0);
    });

    test("ReviewDAO_2.3: It should return an SQL error", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBAll.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, rows: any) => void) => {
            callback(new Error(), undefined);
            return {} as Database
        });
        await expect(reviewDAO.getProductReviews(model)).rejects.toThrow(Error);
        expect(mockDBAll).toHaveBeenCalledTimes(1);
    });
});

describe("ReviewDAO_3: deleteReview method tests", () => {
    let mockDBGet: any;
    let mockDBRun: any;
    const model = "iPhoneX";
    const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");

    beforeEach(async () => {
        mockDBGet = jest.spyOn(db, "get");
        mockDBRun = jest.spyOn(db, "run");
    });

    afterEach( () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test("ReviewDAO_3.1: It should return nothing", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, {model: model});
            return {} as Database
        }).mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, {id: 1});
            return {} as Database
        });
        mockDBRun.mockImplementationOnce((_sql: any, _params: any, callback: any) => {
            callback(null)
            return {} as Database
        });
        const result = await reviewDAO.deleteReview(model, user);
        expect(result).toBe(undefined);
        expect(mockDBGet).toHaveBeenCalledTimes(2);
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });

    test("ReviewDAO_3.2: It should return ProductNotFoundError", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, undefined);
            return {} as Database
        });
        await expect(reviewDAO.deleteReview(model, user)).rejects.toThrow(ProductNotFoundError);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });

    test("ReviewDAO_3.3: It should return NoReviewProductError", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, {model: model});
            return {} as Database
        }).mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, undefined);
            return {} as Database
        });
        await expect(reviewDAO.deleteReview(model, user)).rejects.toThrow(NoReviewProductError);
        expect(mockDBGet).toHaveBeenCalledTimes(2);
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });

    test("ReviewDAO_3.4: It should return an SQL error", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(new Error(), undefined);
            return {} as Database
        });
        await expect(reviewDAO.deleteReview(model, user)).rejects.toThrow(Error);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });
});

describe("ReviewDAO_4: deleteReviewsOfProduct method tests", () => {
    let mockDBGet: any;
    let mockDBRun: any;
    const model = "iPhoneX";

    beforeEach(async () => {
        mockDBGet = jest.spyOn(db, "get");
        mockDBRun = jest.spyOn(db, "run");
    });

    afterEach( () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test("ReviewDAO_4.1: It should return nothing", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, {model: model});
            return {} as Database
        });
        mockDBRun.mockImplementation((_sql: any, _params: any, callback: any) => {
            callback(null)
            return {} as Database
        });
        const result = await reviewDAO.deleteReviewsOfProduct(model);
        expect(result).toBe(undefined);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });

    test("ReviewDAO_4.2: It should return a ProductNotFoundError", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(null, undefined);
            return {} as Database
        });
        await expect(reviewDAO.deleteReviewsOfProduct(model)).rejects.toThrow(ProductNotFoundError);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });

    test("ReviewDAO_4.3: It should return an SQL error", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBGet.mockImplementationOnce((_sql: any, _params: any, callback: (err: Error | null, row: any) => void) => {
            callback(new Error(), undefined);
            return {} as Database
        });
        await expect(reviewDAO.deleteReviewsOfProduct(model)).rejects.toThrow(Error);
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        expect(mockDBRun).toHaveBeenCalledTimes(0);
    });
});

describe("ReviewDAO_5: deleteAllReviews method tests", () => {
    let mockDBRun: any;

    beforeEach(async () => {
        mockDBRun = jest.spyOn(db, "run");
    });

    afterEach( () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    
    test("ReviewDAO_5.1: It should return nothing", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBRun.mockImplementation((_sql: any, callback: any) => {
            callback(null)
            return {} as Database
        });
        const result = await reviewDAO.deleteAllReviews();
        expect(result).toBe(undefined);
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });

    test("ReviewDAO_5.2: It should return an SQL error", async () => {
        const reviewDAO = new ReviewDAO();
        mockDBRun.mockImplementation((_sql: any, callback: any) => {
            callback(new Error())
            return {} as Database
        });
        await expect(reviewDAO.deleteAllReviews()).rejects.toThrow(Error);
        expect(mockDBRun).toHaveBeenCalledTimes(1);
    });
});