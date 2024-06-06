import { Utility } from "../utilities";
import db from "../db/db";
import dayjs from "dayjs";
import { Product } from "../components/product";
import {
  FutureDateError,
  LowProductStockError,
  ProductNotFoundError,
} from "../errors/productError";
import { ProductAlreadyExistsError } from "../errors/productError";
import { ERROR } from "sqlite3";

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
        //validation

        // if ((model = "")) return reject(new Error("Model cannot be empty"));
        //
        // if (quantity <= 0)
        //   return reject(new Error("Quantity should be greater then 0"));
        //
        // if (sellingPrice <= 0)
        //   return reject(new Error("Selling price should be greater then 0"));
        //
        // if (
        //   category != "Smartphone" &&
        //   category != "Laptop" &&
        //   category != "Appliance"
        // )
        //   return reject(new Error("Not a valid category"));

        if (arrivalDate == null) arrivalDate = dayjs().format("YYYY-MM-DD");

        if (arrivalDate && dayjs(arrivalDate).isAfter(dayjs()))
          return reject(new FutureDateError());

        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(arrivalDate)) {
          return reject(new Error("Date is in the wrong format"));
        }

        const insertQuery =
          "INSERT INTO products (model, category, quantity, details, arrivalDate, sellingPrice) VALUES (?,?,?,?,?,?)";

        const getProductModel = "SELECT * FROM products WHERE model == ?";

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
            return reject(new ProductAlreadyExistsError());
          }
        });
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
      //validation

      // if ((model = "")) return reject(new Error("Model cannot be empty"));
      //
      // if (newQuantity <= 0)
      //   return reject(Error("Quantity should be greater then 0"));

      if (arrivalDate == null) arrivalDate = dayjs().format("YYYY-MM-DD");

      if (arrivalDate && dayjs(arrivalDate).isAfter(dayjs()))
        return reject(new FutureDateError());

      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(arrivalDate)) {
        return reject(new Error("Date is in the wrong format"));
      }

      const updateQuery =
        "UPDATE products SET quantity = quantity + ? WHERE model = ?";
      const getProductModel = "SELECT * FROM products WHERE model = ?";

      db.get(getProductModel, [model], (err: Error | null, row: any) => {
        if (err) return reject(err);
        if (!row) {
          return reject(new ProductNotFoundError());
        } else if (dayjs(row.arrivalDate).isAfter(dayjs(arrivalDate))) {
          return reject(new FutureDateError())
        }
        else {
          const oldQuantity = row.quantity;
          db.run(updateQuery, [newQuantity, model], (err: Error | null) => {
            if (err) return reject(err);
            return resolve(oldQuantity + newQuantity);
          });
        }
      });
    });
  }

  async getProducts(
    grouping: string | null,
    category: string | null,
    model: string | null
  ) {
    return new Promise<Product[]>((resolve, reject) => {
      try {
        //validation

        let selectQuery = "SELECT * FROM products";

        if (grouping == "model" && category==null && model!=null)
          selectQuery = "SELECT * FROM products WHERE model='" + model + "'";
        else if (grouping == "category" && category!=null && model==null)
          selectQuery = "SELECT * FROM products WHERE category='" + category + "'";
        else if (grouping == null)
          selectQuery = "SELECT * FROM products";
        else
          return reject(Error("Not a valid grouping"));

        db.all(selectQuery, [], (err: Error | null, rows: any[]) => {
          if (err) {
            return reject(err);
          }

          if (rows.length == 0 && grouping == "model") {
            return reject(new ProductNotFoundError())
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

  async getAvailableProducts(
    grouping: string | null,
    category: string | null,
    model: string | null
  ): Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
      try {

        //validation

        let selectQuery = "SELECT * FROM products WHERE quantity > 0";

        if (grouping == "model")
          selectQuery = "SELECT * FROM products WHERE model='" + model + " AND quantity > 0'";
        else if (grouping == "category")
          selectQuery = "SELECT * FROM products WHERE category='" + category + " AND quantity > 0'";
        else if (grouping == null)
          selectQuery = "SELECT * FROM products WHERE quantity > 0";
        else
          return reject(Error("Not a valid grouping"));

        db.all(selectQuery, [], (err: Error | null, rows: any[]) => {
          if (err) {
            return reject(err);
          }

          if (rows.length == 0 && grouping == "model") {
            return reject(new ProductNotFoundError())
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
        //validation

        if ((model = "")) return reject(Error("Model cannot be empty"));

        if (quantity <= 0)
          return reject(Error("Quantity should be greater then 0"));

        if (sellingDate == null) sellingDate = dayjs().format("YYYY-MM-DD");

        if (sellingDate && dayjs(sellingDate).isAfter(dayjs()))
          return reject(new FutureDateError());

        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(sellingDate)) {
          return reject(new Error("Date is in the wrong format"));
        }

        const getProductQuery = "SELECT * FROM products WHERE model == ?";
        const updateQuantityQuery = "UPDATE products SET quantity = quantity - ? WHERE model == ?";

        db.get(getProductQuery, [model], (err: Error | null, row: any) => {
          if (err) {
            return reject(err);
          }

          if (!row) {
            return reject(new ProductNotFoundError());
          }

          if (row.arrivalDate && dayjs(row.arrivalDate).isAfter(dayjs(sellingDate))) {
            return reject(new FutureDateError())
          }

          if (row.quantity == 0) {
            return reject(new LowProductStockError());
          }

          if (row.quantity < quantity) {
            return reject(new LowProductStockError());
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

        db.run(deleteQuery, (err: Error | null) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  async deleteProduct(model: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {

        //validation

        if ((model = "")) return reject(Error("Model cannot be empty"));

        const deleteQuery = "DELETE FROM products WHERE model == ?";
        const getProductQuery = "SELECT * FROM products WHERE model == ?";

        db.get(getProductQuery, [model], (err: Error | null, row: any) => {
          if (err) {
            return reject(err);
          }

          if (!row) {
            return reject(new ProductNotFoundError());
          }

          db.run(deleteQuery, [model], (err: Error | null) => {
            if (err) {
              return reject(err);
            }
            return resolve(true);
          });
        });
      } catch (error) {
        return reject(error);
      }
    });
  }


}

export default ProductDAO;
