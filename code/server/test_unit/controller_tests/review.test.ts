import { test, expect, jest } from "@jest/globals";
import ReviewController from "../../src/controllers/reviewController";
import ReviewDAO from "../../src/dao/reviewDAO";
import { Role, User } from "../../src/components/user";
import { ProductReview } from "../../src/components/review";

jest.mock("../../src/dao/reviewDAO");


describe("ReviewController_1: addReview method tests", () => {
    test("ReviewController_1.1: It should return nothing", async () => {
        const model = "iPhoneX";
        const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const score = 2;
        const comment = "commento di test";
        jest.spyOn(ReviewDAO.prototype, "addReview").mockResolvedValueOnce(undefined);
        const controller = new ReviewController();
        const response = await controller.addReview(model, user, score, comment);
        expect(ReviewDAO.prototype.addReview).toHaveBeenCalledTimes(1);
        expect(ReviewDAO.prototype.addReview).toHaveBeenCalledWith(model, user, score, comment);
        expect(response).toBe(undefined);
    });
});

describe("ReviewController_2: getProductReviews method tests", () => {
    test("ReviewController_2.1: It should return ProductReview[]", async () => {
        const reviews: ProductReview[] = [];
        const model = "iPhoneX";
        jest.spyOn(ReviewDAO.prototype, "getProductReviews").mockResolvedValueOnce(reviews);
        const controller = new ReviewController();
        const response = await controller.getProductReviews(model);
        expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledTimes(1);
        expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledWith(model);
        expect(response).toBe(reviews);
    });
});

describe("ReviewController_3: deleteReview method tests", () => {
    test("ReviewController_3.1: It should return nothing", async () => {
        const model = "iPhoneX";
        const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        jest.spyOn(ReviewDAO.prototype, "deleteReview").mockResolvedValueOnce(undefined);
        const controller = new ReviewController();
        const response = await controller.deleteReview(model, user);
        expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledTimes(1);
        expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledWith(model, user);
        expect(response).toBe(undefined);
    });
});

describe("ReviewController_4: deleteReviewsOfProduct method tests", () => {
    test("ReviewController_4.1: It should return nothing", async () => {
        const model = "iPhoneX";
        jest.spyOn(ReviewDAO.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce(undefined);
        const controller = new ReviewController();
        const response = await controller.deleteReviewsOfProduct(model);
        expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1);
        expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith(model);
        expect(response).toBe(undefined);
    });
});

describe("ReviewController_5: deleteAllReviews method tests", () => {
    test("ReviewController_5.1: It should return nothing", async () => {
        jest.spyOn(ReviewDAO.prototype, "deleteAllReviews").mockResolvedValueOnce(undefined);
        const controller = new ReviewController();
        const response = await controller.deleteAllReviews();
        expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalledTimes(1);
        expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalledWith();
        expect(response).toBe(undefined);
    });
});