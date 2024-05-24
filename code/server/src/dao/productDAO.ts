import { Utility } from "../utilities";
import db from "../db/db";
import dayjs from "dayjs";
import { Product } from "../components/product";

/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {
  async registerProducts(
    model: string,
    category: string,
    quantity: number,
    details: string | null,
    sellingPrice: number,
    arrivalDate: string | null
  ) {
    return new Promise<void>((resolve, reject) => {
      try {
        const insertQuery =
          "INSERT INTO products (model, category, quantity, details, arrivalDate, sellingPrice) VALUES (?,?,?,?,?,?)";
        const updateQuery =
          "UPDATE products SET quantity = quantity + ? WHERE model = ?";

        const getProductModel = "SELECT * FROM products WHERE model == ?";

        if (arrivalDate == null) arrivalDate = dayjs().format("YYYY-MM-DD");

        if (dayjs(arrivalDate).isAfter(dayjs())) {
          return reject(new Error("Arrival date cannot be in the future"));
        }

        if (Utility.isManager || Utility.isAdmin) {
          db.get(getProductModel, [model], (err: Error | null, row: any) => {
            if (err) {
              return reject(err);
            }

            if (!row) {
              db.run(
                insertQuery,
                [model, category, quantity, details, arrivalDate, sellingPrice],
                (err: Error | null) => {
                  if (err) {
                    return reject(err);
                  }
                  return resolve();
                }
              );
            } else {
              db.run(updateQuery, [quantity, model], (err: Error | null) => {
                if (err) {
                  return reject(err);
                }
                return resolve();
              });
            }
          });
        } else {
          return reject(new Error("Unauthorized access")); // Gestione dell'accesso non autorizzato
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  async changeProductQuantity(
    model: string,
    newQuantity: number,
    arrivalDate: string | null
  ) {
    return new Promise<number>((resolve, reject) => {
      const updateQuery =
        "UPDATE products SET quantity = quantity + ? WHERE model = ?";
      const getProductModel = "SELECT * FROM products WHERE model = ?";

      //manca controllo data

      if (Utility.isManager || Utility.isAdmin) {
        db.get(getProductModel, [model], (err: Error | null, row: any) => {
          if (err) return reject(err);
          if (!row) {
            return reject();
          } else {
            const oldQuantity = row.quantity;
            db.run(updateQuery, [newQuantity, model], (err: Error | null) => {
              if (err) return reject(err);

              return resolve(oldQuantity + newQuantity);
            });
          }
        });
      } else {
        return reject();
      }
    });
  }

  async getProducts(
    grouping: string | null,
    category: string | null,
    model: string | null
  ) {
    return new Promise<Product[]>((resolve, reject) => {
      try {
        let selectQuery = "SELECT * FROM products";

        if (grouping == "model") {
          selectQuery = "SELECT * FROM products WHERE model='" + model + "'";
        } else if (grouping == "category") {
          selectQuery =
            "SELECT * FROM products WHERE category='" + category + "'";
        } else {
          //manca gestione caso grouping == null
          selectQuery = "SELECT * FROM products";
        }

        db.all(selectQuery, [], (err: Error | null, rows: any[]) => {
          if (err) {
            return reject(err);
          }

          const products: Product[] = rows.map(
            (row) =>
              new Product(
                row.sellingPrice,
                row.model,
                row.category,
                row.arrivalDate,
                row.details,
                row.quantity
              )
          );

          return resolve(products);
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  async sellProduct(
    model: string,
    quantity: number,
    sellingDate: string | null
  ): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      try {
        const getProductQuery = "SELECT * FROM products WHERE model == ?";
        const updateQuantityQuery =
          "UPDATE products SET quantity = quantity - ? WHERE model == ?";

        console.log("model: " + model);
        console.log("quantity: " + quantity);
        console.log("sellingDate: " + sellingDate);

        // Verifica che il sellingDate sia valido e non sia nel futuro
        if (sellingDate && dayjs(sellingDate).isAfter(dayjs())) {
          return reject(new Error("Selling date cannot be in the future"));
        }

        db.get(getProductQuery, [model], (err: Error | null, row: any) => {
          if (err) {
            return reject(err);
          }

          if (!row) {
            return reject(new Error("Product not found"));
          }

          if (row.quantity < quantity) {
            return reject(new Error("Not enough quantity available"));
          }

          db.run(
            updateQuantityQuery,
            [quantity, model],
            (err: Error | null) => {
              if (err) {
                return reject(err);
              }
              resolve(quantity);
            }
          );
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async deleteAllProducts(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const deleteQuery = "DELETE FROM products";

        if (Utility.isManager || Utility.isAdmin) {
          db.run(deleteQuery, (err: Error | null) => {
            if (err) {
              return reject(err);
            }
            return resolve(true);
          });
        } else {
          return reject(new Error("Unauthorized access"));
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  async deleteProduct(model: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const deleteQuery = "DELETE FROM products WHERE model == ?";
        const getProductQuery = "SELECT * FROM products WHERE model == ?";

        if (Utility.isManager || Utility.isAdmin) {
          db.get(getProductQuery, [model], (err: Error | null, row: any) => {
            if (err) {
              return reject(err);
            }

            if (!row) {
              return reject(new Error("Product not found"));
            }

            db.run(deleteQuery, [model], (err: Error | null) => {
              if (err) {
                return reject(err);
              }
              return resolve(true);
            });
          });
        } else {
          return reject(new Error("Unauthorized access"));
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  async getAvailableProducts(
    grouping: string | null,
    category: string | null,
    model: string | null
  ): Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
      try {
        let query = "SELECT * FROM products WHERE quantity > 0";
        const params: any[] = [];

        if (grouping === "category" && category) {
          query += " AND category = ?";
          params.push(category);
        } else if (grouping === "model" && model) {
          query += " AND model = ?";
          params.push(model);
        }

        db.all(query, params, (err: Error | null, rows: any[]) => {
          if (err) {
            return reject(err);
          }
          return resolve(rows);
        });
      } catch (error) {
        return reject(error);
      }
    });
  }
}

export default ProductDAO;
