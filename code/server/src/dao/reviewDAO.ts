import { ExistingReviewError } from "../errors/reviewError";
import { User } from "../components/user";
import db from "../db/db"
import { ProductReview } from "../components/review";
import dayjs from "dayjs";
/**
 * A class that implements the interaction with the database for all review-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ReviewDAO {

    /**
     * Adds a new review for a product
     * @param model The model of the product to review
     * @param user The username of the user who made the review
     * @param score The score assigned to the product, in the range [1, 5]
     * @param comment The comment made by the user
     * @returns A Promise that resolves to nothing
     */
    addReview(model: string, user: User, score: number, comment: string) :Promise<void> {
        return new Promise<void>((resolve,reject)=> {
            try {
                const sql = "INSERT INTO review(model, user, score,date, comment) VALUES(?, ?, ?,?, ?)"
                db.run(sql, [model, user, score, dayjs().format("YYYY-MM-DD"),comment], (err: Error | null) => {
                    if (err) {
                        if (err.message.includes("UNIQUE constraint failed: ")) reject(new ExistingReviewError)
                        reject(err)
                    }
                    resolve()
                })
            } catch (error) {
                reject(error)
            }

        })
     }

      /**
     * Returns all reviews for a product
     * @param model The model of the product to get reviews from
     * @returns A Promise that resolves to an array of ProductReview objects
     */
    getProductReviews(model: string) :Promise<ProductReview[]>  { 
        return new Promise<ProductReview[]> ((resolve,reject)=> {
            try {
                let reviews: ProductReview[]=[];
                const sql= "SELECT * FROM review where model==?";
                db.all(sql,[model], (err: Error | null, rows:any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                 
                    else {
                        reviews = rows.map((review:any) => new ProductReview(review.model,review.user,review.score,review.date,review.comment))
                        resolve(reviews)
                    }
                })
            }catch(error){
                reject(error)
            }
        });
    }

    /**
     * Deletes the review made by a user for a product
     * @param model The model of the product to delete the review from
     * @param user The user who made the review to delete
     * @returns A Promise that resolves to nothing
     */
    deleteReview(model: string, user: User) :Promise<void> { 
        return new Promise<void> ((resolve,reject)=> {
            try{
            const sql= "DELETE from review WHERE model==? AND user==?"
            db.run(sql, [model,user],(err:Error | null)=> {
                if(err) {
                    reject(err)
                    return
                }
                else {
                    resolve();
                }
            })
        }catch(error){
            reject(error)
    }

        })
    }

    /**
     * Deletes all reviews for a product
     * @param model The model of the product to delete the reviews from
     * @returns A Promise that resolves to nothing
     */
    deleteReviewsOfProduct(model: string) :Promise<void>  {
        return new Promise<void> ((resolve,reject)=> {
            try{
            const sql= "DELETE from review WHERE model==?"
            db.run(sql, [model],(err:Error | null)=> {
                if(err) {
                    reject(err)
                    return
                }
                else {
                    resolve();
                }
            })
        }catch(error){
            reject(error)
    }

        })
     }

    /**
     * Deletes all reviews of all products
     * @returns A Promise that resolves to nothing
     */
    deleteAllReviews() :Promise<void>  {
        return new Promise<void> ((resolve,reject)=> {
            try{
            const sql= "DELETE * from review "
            db.run(sql, [], (err:Error | null)=> {
                if(err) {
                    reject(err)
                    return
                }
                else {
                    resolve();
                }
            })
        }catch(error){
            reject(error)
    }

        })
     }



}

export default ReviewDAO;