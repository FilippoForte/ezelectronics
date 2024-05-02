# Project Estimation - CURRENT
Date: 01/05/24

Version: V1


# Estimation approach
Consider the EZElectronics  project in CURRENT version (as given by the teachers), assume that you are going to develop the project INDEPENDENT of the deadlines of the course, and from scratch
# Estimate by size
### 
|                                                                                                        | Stima                       |             
| ------------------------------------------------------------------------------------------------------ | --------------------------- |  
| NC =  Estimated number of classes to be developed                                                      |  10                         |             
| A = Estimated average size per class, in LOC                                                           |  200                        | 
| S = Estimated size of project, in LOC (= NC * A)                                                       |  2000                       |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)                   |  200                        |   
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro)                                    |  6000                       | 
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week )|  1.25                       |               

# Estimate by product decomposition
### 
|         Nome componente   | Effort stimata (person hours)     |             
| ------------------------- | --------------------------------- | 
| requirement document      | 35                                |
| GUI prototype             | 15                                |
| design document           | 15                                |
| code                      | 150                               |
| unit tests                | 25                                |
| api tests                 | 25                                |
| management documents      | 10                                |
| TOTALE                    | 275                               |


# Estimate by activity decomposition
### 
|         Nome attività                | Effort stimata (person hours)     |             
| ------------------------------------ | --------------------------------- |
| Gestione progetto                    |                                   |
| management documents                 | 10                                |
| Documento dei requisiti              |                                   |
| Definire requisiti                   | 10                                |
| definire contextDiagram e interfacce | 4                                 |
| Scrivere Stories and personas        | 3                                 |
| Scrivere gli use cases               | 20                                |
| Definire glossary e system design    | 5                                 |
| Definire deployment diagram          | 4                                 |
| Disegnare il prototipo della GUI     |                                   |
| Define interaction                   | 3                                 |
| Define layout                        | 15                                |
| Codificare l'applicativo             |                                   |
| Definire classi                      | 20                                |
| Definire metodi                      | 55                                |
| Scrivere codice                      | 75                                |
| Test e debug                         |                                   |
| Test unit                            | 25                                |
| Test api                             | 25                                |
| TOTALE                               | 274                               |

###

![Gant](./img/GantV1.png)

# Summary

Consideriamo la stima "by size" la meno precisa visto che tiene conto solo delle linee di codice scritte e non del tempo impiegato per
le fasi di project management, planning e la creazione dei documenti ad esso necessari.
Le altre due stime sono piu' precise in quanto tengono conto delle altre fasi di progetto.


|                                    | Effort stimata (person hour)            | Durata stimata     (calendar weeks) |          
| ---------------------------------- | --------------------------------------- | ----------------------------------- |
| estimate by size                   | 200                                     | 1.25                                |
| estimate by product decomposition  | 275                                     | ~1.72                               |
| estimate by activity decomposition | 274                                     | ~1.71                               |

