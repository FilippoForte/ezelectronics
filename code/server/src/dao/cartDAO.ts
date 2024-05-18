import db from "../db/db";
import { User } from "../components/user"
import { Cart, ProductInCart } from "../components/cart"
import { CartNotFoundError, EmptyCartError, ProductNotInCartError } from "../errors/cartError";

/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {

    async addToCart(user: User, product: string)/*: Promise<Boolean>*/ {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM carts WHERE customer == ? and paid == false";
                let id;
                let sql4 = "";
                db.get(sql, [user.username], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                    }
                    if (row == 0) {
                        id = -1;
                    }
                });
                if(id == -1)
                {
                    const sql1 = "INSERT INTO carts(customer, paid, paymentDate) VALUES(?, ?, ?)"
                    db.run(sql1, [user.username, false, null], (err: Error | null) => {
                        if (err) {
                            reject(err)
                        }
                    });
                }
                const sql2 = "SELECT id FROM carts WHERE customer == ? and paid == false";
                db.get(sql2, [user.username], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                    }
                    if (row > 0) {
                        id = row.id;
                    }
                });
                const sql3 = "SELECT * FROM ProductInCart WHERE modelProduct == ? and idCart == ?";
                db.get(sql3, [user.username], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                    }
                    if (row > 0) {
                        sql4 = "UPDATE ProductInCart WHERE modelProduct == ? and idCart == ? SET quantityInCart = quantityInCart + 1";
                    }
                    else
                    {
                        sql4 = "INSERT INTO ProductInCart(modelProduct, idCart, quantityInCart) VALUES(?, ?, 1)";
                    }
                });
                db.run(sql4, [product, id], (err: Error | null) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(true)
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    async getCart(user: User)/*: Cart*/ {
        try {
            let products: ProductInCart[] = [];
            let cart: Cart = new Cart("", null, null, 0, products);
            let id = -1;
            const sql = "SELECT * FROM carts WHERE customer == ? and paid == false";
            db.get(sql, [user.username], (err: Error | null, row: any) => {
                if (err) {
                    return
                }
                if (row == 0) {
                    return cart;
                }
                id = row.id
                cart.customer = row.customer;
                cart.paid = false;
            });
            const sql1 = "SELECT modelProduct, quantityInCart, category, sellingPrice FROM ProductInCart PC, products P WHERE PC.modelProduct==P.model and idCart == ?";
            db.all(sql1, [id], (err: Error | null, rows: any) => {
                if (err) {
                    return
                }
                for (let row of rows)
                {
                    cart.products.push(new ProductInCart(row.modelProduct, row.quantityInCart, row.category, row.sellingPrice));
                    cart.total = cart.total + (row.quantityInCart * row.sellingPrice);
                }
            });
            return cart;
        } catch (error) {
            
        }
    }

    async checkoutCart(user: User) /**Promise<Boolean> */ { 
        return new Promise<boolean>((resolve, reject) => {
            try {
                let id;
                const sql = "SELECT * FROM carts WHERE customer == ? and paid == false";
                db.get(sql, [user.username], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                    }
                    if (row == 0) {
                        reject(new CartNotFoundError);
                    }
                    id = row.id;
                });
                const sql1 = "SELECT modelProduct, quantityInCart, quantity, sellingPrice FROM ProductInCart PC, products P WHERE PC.modelProduct==P.model and idCart == ?";
                const sql2 = "UPDATE products WHERE model == ? SET quantity = quantity - ?";
                db.all(sql1, [id], (err: Error | null, rows: any) => {
                    if (err) {
                        reject(err);
                    }
                    if (rows.lenght == 0) {
                        reject(new EmptyCartError);
                    }
                    for (let row of rows)
                    {
                        if (row.quantity < row.quantityInCart)
                        {
                            resolve(false);
                        }
                        db.run(sql2, [row.modelProduct, row.quantityInCart], (err: Error | null) => {
                            if (err) {
                                reject(err)
                            }
                        });
                    }
                });
                const sql3 = "UPDATE carts WHERE id == ? SET paid = true, paymentDate = ?";
                const data = new Date();
                let oggi = data.getDate() + "/" + data.getMonth() + 1 + "/" + data.getFullYear();
                db.run(sql2, [id, oggi], (err: Error | null) => {
                    if (err) {
                        reject(err)
                    }
                });
                resolve(true);
            } catch (error) {
                reject(error)
            }
        });
    }

    async getCustomerCarts(user: User)/**Promise<Cart[]> */ { 
        return new Promise<Cart[]>((resolve, reject) => {
            try {
                let carts: Cart[] = [];
                const sql = "SELECT * FROM carts WHERE customer == ? and paid == true";
                const sql1 = "SELECT modelProduct, quantityInCart, category, sellingPrice FROM ProductInCart PC, products P WHERE PC.modelProduct==P.model and idCart == ?";
                db.all(sql, [user.username], (err: Error | null, rows: any) => {
                    if (err) {
                        reject(err);
                    }
                    for (let row of rows)
                    {
                        let products: ProductInCart[] = [];
                        let tot = 0;
                        db.all(sql1, [row.id], (err: Error | null, rows1: any) => {
                            if (err) {
                                reject(err);
                            }
                            for (let row1 of rows1)
                            {
                                products.push(new ProductInCart(row1.modelProduct, row1.quantityInCart, row1.category, row1.sellingPrice));
                                tot = tot + (row1.quantityInCart * row1.sellingPrice);
                            }
                        });
                        carts.push(new Cart(row.customer, row.paid, row.paymentDate, tot, products));
                    }
                });
                resolve(carts);
            } catch (error) {
                reject(error)
            }
        });
    }

    async removeProductFromCart(user: User, product: string) /**Promise<Boolean> */ { 
        return new Promise<boolean>((resolve, reject) => {
            try {
                let id;
                const sql = "SELECT * FROM carts WHERE customer == ? and paid == false";
                let sql2 = "";
                db.get(sql, [user.username], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                    }
                    if (row == 0) {
                        reject(new CartNotFoundError);
                    }
                    id = row.id;
                });
                const sql1 = "SELECT quantityInCart FROM ProductInCart WHERE modelProduct == ? and idCart == ?";
                db.get(sql1, [product, id], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                    }
                    if (row == 0) {
                        reject(new ProductNotInCartError);
                    }
                    if (row.quantityInCart > 1)
                    {
                        sql2 = "UPDATE ProductInCart WHERE modelProduct == ? and idCart == ? SET quantityInCart = quantityInCart - 1";;
                    }
                    else
                    {
                        sql2 = "DELETE FROM ProductInCart WHERE modelProduct == ? and idCart == ?";
                    }
                });
                db.run(sql2, [product, id], (err: Error | null) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(true)
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    async clearCart(user: User)/*:Promise<Boolean> */ { 
        return new Promise<boolean>((resolve, reject) => {
            try {
                let id;
                const sql = "SELECT id FROM carts WHERE customer == ? and paid == false";
                db.get(sql, [user.username], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                    }
                    if (row == 0) {
                        reject(new CartNotFoundError);
                    }
                    id = row.id;
                });
                const sql1 = "DELETE FROM ProductInCart WHERE idCart == ?";
                db.run(sql1, [id], (err: Error | null) => {
                    if (err) {
                        reject(err);
                    }
                });
                resolve(true)
            } catch (error) {
                reject(error);
            }
        });
    }

    async deleteAllCarts() /**Promise<Boolean> */ { 
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "DELETE FROM ProductInCart";
                db.run(sql, [], (err: Error | null) => {
                    if (err) {
                        reject(err);
                    }
                });
                const sql1 = "DELETE FROM carts";
                db.run(sql1, [], (err: Error | null) => {
                    if (err) {
                        reject(err);
                    }
                });
                resolve(true);
            } catch (error) {
                reject(error)
            }
        });
    }

    async getAllCarts() /*:Promise<Cart[]> */ { 
        return new Promise<Cart[]>((resolve, reject) => {
            try {
                let carts: Cart[] = [];
                const sql = "SELECT * FROM carts";
                const sql1 = "SELECT modelProduct, quantityInCart, category, sellingPrice FROM ProductInCart PC, products P WHERE PC.modelProduct==P.model and idCart == ?";
                db.all(sql, [], (err: Error | null, rows: any) => {
                    if (err) {
                        reject(err);
                    }
                    for (let row of rows)
                    {
                        let products: ProductInCart[] = [];
                        let tot = 0;
                        db.all(sql1, [row.id], (err: Error | null, rows1: any) => {
                            if (err) {
                                reject(err);
                            }
                            for (let row1 of rows1)
                            {
                                products.push(new ProductInCart(row1.modelProduct, row1.quantityInCart, row1.category, row1.sellingPrice));
                                tot = tot + (row1.quantityInCart * row1.sellingPrice);
                            }
                        });
                        carts.push(new Cart(row.customer, row.paid, row.paymentDate, tot, products));
                    }
                });
                resolve(carts);
            } catch (error) {
                reject(error)
            }
        });
    }
}

export default CartDAO