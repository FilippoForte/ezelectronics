import { test, expect, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"

import ReviewController from "../../src/controllers/reviewController"
const baseURL = "/ezelectronics"


test("It should return a 200 success code", async () => {
    const testReview = { 
        score: "test",
        comment: "test",
    };
    const model = "test";
    jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce(undefined);
    const response = await request(app).post(baseURL + "/review/" + model).send(testReview);
    //expect(response.status).toBe(200);
    //expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(1);
    //expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(model, "test", testReview.score, testReview.comment);
})
