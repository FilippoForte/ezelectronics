import db from "../db/db";
import { User } from "../components/user"
import { Cart, ProductInCart } from "../components/cart"
import { CartNotFoundError, ProductInCartError, ProductNotInCartError, WrongUserCartError, EmptyCartError } from "../errors/cartError";
import dayjs from "dayjs";

/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {

    async addToCart(user: User, product: string): Promise<Boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "SELECT id FROM carts WHERE customer == ? and paid == 0";
                const sql1 = "INSERT INTO carts(customer, paid, paymentDate) VALUES(?, ?, ?)";
                const sql2 = "SELECT * FROM productInCart WHERE modelProduct == ? and idCart == ?";
                let sql3 = "";
                db.get(sql, [user.username], (err: Error | null, row: any) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!row) {
                        db.run(sql1, [user.username, false, null], (err1: Error | null) => {
                            if (err1) {
                                return reject(err1);
                            }
                        });
                    }
                    db.get(sql, [user.username], (err1: Error | null, row1: any) => {
                        if (err1) {
                            return reject(err1);
                        }
                        if (row1) {
                            //ho trovato id carrello
                            db.get(sql2, [product, row1.id], (err2: Error | null, row2: any) => {
                                if (err2) {
                                    return reject(err2);
                                }
                                if (!row2) {
                                    sql3 = "INSERT INTO productInCart(modelProduct, idCart, quantityInCart) VALUES(?, ?, 1)";
                                }
                                else
                                {
                                    sql3 = "UPDATE productInCart SET quantityInCart = quantityInCart + 1 WHERE modelProduct == ? and idCart == ?";
                                }
                                db.run(sql3, [product, row1.id], (err3: Error | null) => {
                                    if (err3) {
                                        return reject(err3);
                                    }
                                    return resolve(true);
                                });
                            });
                        }
                    });
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    async getCart(user: User): Promise<Cart> {
        return new Promise<Cart>((resolve, reject) => {
            try {
                let products: ProductInCart[] = [];
                let cart: Cart = new Cart("", null, null, 0, products);
                const sql = "SELECT * FROM carts WHERE customer == ? and paid == 0";
                const sql1 = "SELECT modelProduct, quantityInCart, category, sellingPrice FROM productInCart PC, products P WHERE PC.modelProduct==P.model and idCart == ?";
                db.get(sql, [user.username], (err: Error | null, row: any) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!row) {
                        //return reject(new CartNotFoundError);
                        return resolve(cart);
                    }
                    cart.customer = row.customer;
                    cart.paid = false;
                    db.all(sql1, [row.id], (err1: Error | null, rows: any) => {
                        if (err1) {
                            return reject(err1);
                        }
                        for (let r of rows)
                        {
                            cart.products.push(new ProductInCart(r.modelProduct, r.quantityInCart, r.category, r.sellingPrice));
                            cart.total = cart.total + (r.quantityInCart * r.sellingPrice);
                        }
                        return resolve(cart);
                    });
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    async checkoutCart(user: User): Promise<Boolean> { 
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "SELECT id FROM carts WHERE customer == ? and paid == 0";
                const sql1 = "SELECT modelProduct, quantityInCart, quantity, sellingPrice FROM productInCart PC, products P WHERE PC.modelProduct==P.model and idCart == ?";
                const sql2 = "UPDATE products SET quantity = quantity - ? WHERE model == ?";
                const sql3 = "UPDATE carts SET paid = true, paymentDate = ? WHERE id == ?";
                db.get(sql, [user.username], (err: Error | null, row: any) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!row) {
                        return reject(new CartNotFoundError);
                    }
                    db.all(sql1, [row.id], (err1: Error | null, rows: any) => {
                        if (err1) {
                            return reject(err1);
                        }
                        if (!rows) {
                            return reject(new EmptyCartError);
                        }
                        for (let r of rows)
                        {
                            if (r.quantity < r.quantityInCart)
                            {
                                return resolve(false);
                            }
                            db.run(sql2, [r.quantityInCart, r.modelProduct], (err2: Error | null) => {
                                if (err2) {
                                    return reject(err2)
                                }
                            });
                        }
                        db.run(sql3, [dayjs().format("YYYY-MM-DD"), row.id], (err3: Error | null) => {
                            if (err3) {
                                return reject(err3);
                            }
                        });
                        return resolve(true);
                    });
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    async getCustomerCarts(user: User): Promise<Cart[]> { 
        return new Promise<Cart[]>((resolve, reject) => {
            try {
                let carts: Cart[] = [];
                const sql = "SELECT * FROM carts WHERE customer == ? and paid == 1";
                const sql1 = "SELECT modelProduct, quantityInCart, category, sellingPrice FROM productInCart PC, products P WHERE PC.modelProduct==P.model and idCart == ?";
                db.all(sql, [user.username], async (err: Error | null, rows: any) => {
                    if (err) {
                        return reject(err);
                    }
                    for (let row of rows)
                    {
                        carts.push(await this.ProductInCartFunction(row.id, row.customer, row.paid, row.paymentDate));
                    }
                    return resolve(carts);
                });
            } catch (error) {
                return reject(error)
            }
        });
    }

    async removeProductFromCart(user: User, product: string): Promise<Boolean> { 
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM carts WHERE customer == ? and paid == 0";
                const sql1 = "SELECT quantityInCart FROM productInCart WHERE modelProduct == ? and idCart == ?";
                let sql2 = "";
                db.get(sql, [user.username], (err: Error | null, row: any) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!row) {
                        return reject(new CartNotFoundError);
                    }
                    db.get(sql1, [product, row.id], (err1: Error | null, row1: any) => {
                        if (err1) {
                            return reject(err1);
                        }
                        if (!row1) {
                            return reject(new ProductNotInCartError);
                        }
                        if (row1.quantityInCart > 1)
                        {
                            sql2 = "UPDATE productInCart SET quantityInCart = quantityInCart - 1 WHERE modelProduct == ? and idCart == ?";
                        }
                        else
                        {
                            sql2 = "DELETE FROM productInCart WHERE modelProduct == ? and idCart == ?";
                        }
                        db.run(sql2, [product, row.id], (err2: Error | null) => {
                            if (err2) {
                                return reject(err2);
                            }
                            return resolve(true);
                        });
                    });
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    async clearCart(user: User): Promise<Boolean> { 
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "SELECT id FROM carts WHERE customer == ? and paid == 0";
                const sql1 = "DELETE FROM productInCart WHERE idCart == ?";
                db.get(sql, [user.username], (err: Error | null, row: any) => {
                    if (err) {
                        return reject(err);
                    }
                    if (row == 0) {
                        return reject(new CartNotFoundError);
                    }
                    db.run(sql1, [row.id], (err1: Error | null) => {
                        if (err1) {
                            return reject(err1);
                        }
                        return resolve(true);
                    });
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    async deleteAllCarts(): Promise<Boolean> { 
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "DELETE FROM productInCart";
                const sql1 = "DELETE FROM carts";
                db.run(sql, [], (err: Error | null) => {
                    if (err) {
                        return reject(err);
                    }
                    db.run(sql1, [], (err1: Error | null) => {
                        if (err1) {
                            return reject(err1);
                        }
                        return resolve(true);
                    });
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    async getAllCarts(): Promise<Cart[]> { 
        return new Promise<Cart[]>((resolve, reject) => {
            try {
                let carts: Cart[] = [];
                const sql = "SELECT * FROM carts";
                const sql1 = "SELECT modelProduct, quantityInCart, category, sellingPrice FROM productInCart PC, products P WHERE PC.modelProduct==P.model and idCart == ?";
                db.all(sql, [], async (err: Error | null, rows: any) => {
                    if (err) {
                        return reject(err);
                    }
                    for (let row of rows)
                    {
                        carts.push(await this.ProductInCartFunction(row.id, row.customer, row.paid, row.paymentDate));
                    }
                    return resolve(carts);
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    async ProductInCartFunction(id: string, customer: string, paid: boolean, paymentDate: string): Promise<Cart> { 
        return new Promise<Cart>((resolve, reject) => {
            try {
                const sql = "SELECT modelProduct, quantityInCart, category, sellingPrice FROM productInCart PC, products P WHERE PC.modelProduct==P.model and idCart == ?";
                let products: ProductInCart[] = [];
                let tot = 0;
                db.all(sql, [id], (err: Error | null, rows: any) => {
                    if (err) {
                        return reject(err);
                    }
                    for (let row of rows)
                    {
                        products.push(new ProductInCart(row.modelProduct, row.quantityInCart, row.category, row.sellingPrice));
                        tot = tot + (row.quantityInCart * row.sellingPrice);
                    }
                    return resolve(new Cart(customer, paid, paymentDate, tot, products));
                });
            } catch (error) {
                return reject(error);
            }
        });
    }
}

export default CartDAO;