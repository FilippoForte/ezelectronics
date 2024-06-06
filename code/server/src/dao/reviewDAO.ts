import { ExistingReviewError, NoReviewProductError } from "../errors/reviewError";
import { User } from "../components/user";
import db from "../db/db"
import { ProductReview } from "../components/review";
import dayjs from "dayjs";
import { ProductNotFoundError } from "../errors/productError";
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
    async addReview(model: string, user: User, score: number, comment: string) :Promise<void> {
        return new Promise<void>((resolve,reject)=> {
            try {
                const sql = "INSERT INTO reviews (model, user, score, date, comment) VALUES (?, ?, ?, ?, ?)";
                const sql1 = "SELECT id FROM reviews WHERE reviews.user== ? AND reviews.model== ?";
                const sql2= "SELECT model FROM products WHERE model == ?";
                db.get(sql2, [model], (err: Error | null, row:any)=>{
                    if (!row) {
                        reject(new ProductNotFoundError);
                    }else{
                    db.get(sql1,[user.username,model], (err: Error | null, row:any)=>{
                        if(row){
                            reject(new ExistingReviewError);
                        }else
                        {
                            db.run(sql, [model, user.username, score, dayjs().format("YYYY/MM/DD"),comment], (err: Error | null) => {
                                if (err) {
                                    reject(err)
                                }
                            resolve()
                            })
                        }
                        })
                    }
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
    getProductReviews(model: string): Promise<ProductReview[]> { 
        return new Promise<ProductReview[]>((resolve,reject) => {
            try {
                let reviews: ProductReview[]=[];
                const sql= "SELECT * FROM reviews where model==?";
                db.all(sql,[model], (err: Error | null, rows:any) => {
                    if (err) {
                        return reject(err);
                    }
                    for (let r of rows)
                    {
                        reviews.push(new ProductReview(r.model, r.user, r.score, r.date, r.comment));
                    }
                    return resolve(reviews);
                });
            }catch(error){
                return reject(error);
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
            const sql= "DELETE from reviews WHERE model==? AND user==?"
            const sql1 = "SELECT id FROM reviews WHERE reviews.user== ? AND reviews.model== ?";
            const sql2= "SELECT model FROM products WHERE model == ?";
            
            db.get(sql2, [model], (err: Error | null, row:any)=>{
                if (!row) {
                    reject(new ProductNotFoundError);
                }else{
                db.get(sql1,[user.username,model], (err: Error | null, row:any)=>{
                    if(!row){
                        reject(new NoReviewProductError);
                    }else
                    {
                        db.run(sql, [model,user.username],(err:Error | null)=> {
                        if(err) {
                            reject(err)
                            return
                        }else {
                            resolve();
                        }
                        })
                    }
                    })
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
            const sql= "DELETE from reviews WHERE model==?"
            const sql1= "SELECT model FROM products WHERE model == ?";
            db.get(sql1, [model], (err:Error, row:any)=>{
                if (!row){
                    reject(new ProductNotFoundError);
                }else{
                    db.run(sql, [model],(err:Error | null)=> {
                        if(err) {
                            reject(err)
                            return
                        }else {
                            resolve();
                        }
                    })
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
                const sql= "DELETE * from reviews "
                db.run(sql, (err:Error | null)=> {
                    if(err) {
                        reject(err)
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