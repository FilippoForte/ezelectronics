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
          const insertQuery = "INSERT INTO products (model, category, quantity, details, arrivalDate, sellingPrice) VALUES (?,?,?,?,?,?)";
          const updateQuery = "UPDATE products SET quantity = quantity + ? WHERE model == ?";
          const getProductModel = "SELECT * FROM products WHERE model == ?";


          if (arrivalDate == null) arrivalDate = dayjs().format("YYYY-MM-DD");

          if (dayjs(arrivalDate).isAfter(dayjs())) {
              return reject(new Error("Arrival date cannot be in the future"));
            }
  
          if (Utility.isManager || Utility.isAdmin) {
            // Usare `db.get` anziché `db.run` per la query di selezione
            db.get(getProductModel, [model], (err: Error | null, row: any) => {
              if (err) {
                return reject(err); // Usare `return` per fermare l'esecuzione dopo `reject()`
              }
  
              if (!row) {
                // Aggiunta di `return` per fermare l'esecuzione dopo `reject()` o `resolve()`
                db.run(insertQuery, [model, category, quantity, details, arrivalDate, sellingPrice], (err: Error | null) => {
                  if (err) {
                    return reject(err);
                  }
                  return resolve(); // Risolvere la promise dopo il successo della query di inserimento
                });
              } else {
                // Aggiunta di `return` per fermare l'esecuzione dopo `reject()` o `resolve()`
                db.run(updateQuery, [quantity, model], (err: Error | null) => {
                  if (err) {
                    return reject(err);
                  }
                  return resolve(); // Risolvere la promise dopo il successo della query di aggiornamento
                });
              }
            });
          } else {
            return reject(new Error("Unauthorized access")); // Gestione dell'accesso non autorizzato
          }
        } catch (error) {
          return reject(error); // Usare `return` per fermare l'esecuzione dopo `reject()`
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
        "UPDATE products SET quantity = quantity + ? WHERE model == ?";
      const getProductModel = "SELECT * FROM products WHERE model == ?";

      //manca controllo data futura

      if (Utility.isManager || Utility.isAdmin) {
        db.get(getProductModel, [model], (err: Error | null, row: any) => {
          if (err) return reject(err);
          if (!row) {
            return reject();
          } else {
            const oldQuantity = row.quantity;
            db.run(updateQuery, [row.quantity, model], (err: Error | null) => {
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

        let selectQuery = "SELECT * FROM products"

        if(grouping=="model"){
          selectQuery = "SELECT * FROM products WHERE model='"+model+"'";
        }else if(grouping=="category"){
          selectQuery = "SELECT * FROM products WHERE category='"+category+"'";
        }
        else{
          //manca gestione caso grouping == null
          selectQuery = "SELECT * FROM products"
        }

        console.log("AAAAAAAAAAAAAAAAAAAAAAA")


        console.log(selectQuery)

        db.all(selectQuery, [], (err: Error | null, rows: any[]) => {
          if (err) {
            return reject(err);
          }

          const products: Product[] = rows.map((row) => ( new
            Product(
            row.model,
            row.category,
            row.quantity,
            row.details,
            row.sellingPrice,
            row.arrivalDate,
            )
          ));

          return resolve(products);
        });
      } catch (error) {
        return reject(error);
      }
    });
  }
  
}

export default ProductDAO;
