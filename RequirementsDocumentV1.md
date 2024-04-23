# Requirements Document - current EZElectronics

Date:

Version: V1 - description of EZElectronics in CURRENT form (as received by teachers)

| Version number | Change |
| :------------: | :----: |
|        V1      |        |

# Contents

- [Requirements Document - current EZElectronics](#requirements-document---current-ezelectronics)
- [Contents](#contents)
- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
  - [Context Diagram](#context-diagram)
  - [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Non Functional Requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
  - [Use case diagram](#use-case-diagram)
    - [Use case 1, UC1](#use-case-1-uc1)
      - [Scenario 1.1](#scenario-11)
      - [Scenario 1.2](#scenario-12)
      - [Scenario 1.x](#scenario-1x)
    - [Use case 2, UC2](#use-case-2-uc2)
    - [Use case x, UCx](#use-case-x-ucx)
- [Glossary](#glossary)
- [System Design](#system-design)
- [Deployment Diagram](#deployment-diagram)

# Informal description

EZElectronics (read EaSy Electronics) is a software application designed to help managers of electronics stores to manage their products and offer them to customers through a dedicated website. Managers can assess the available products, record new ones, and confirm purchases. Customers can see available products, add them to a cart and see the history of their past purchases.

# Stakeholders

| Nome dello Stakeholder | Descrizione                                                              |
| :--------------------: | :----------------------------------------------------------------------: |
| Cliente                | Individuo che accede al sito web per visualizzare o comprare prodotti    |
| Manager                | Manager dello store fisico che puo' gestire i prodotti sul sito          |
| Sviluppatori           | Il team di sviluppatori del sistema                                      |
| Amministratore         | Amministratore del sistema                                               |

# Context Diagram and interfaces

## Context Diagram

![contextDiagram](./img/contextDiagramV1.png)

## Interfaces

| Attore           | Interfaccia logica                                                            | Interfaccia fisica |
| :--------------: | :--------------------------------------------------------------------------:  | :----------------: |
| Cliente          | GUI (interfaccia per navigare il sito, visualizzare e comprare prodotti)      | Smartphone / PC    |
| Manager          | GUI (interfaccia per navigare il sito, visualizzare e gestire i prodotti)     | Smartphone / PC    |

# Stories and personas

**Persona 1**: uomo, professionista ad alto reddito, sposato, con figli, 50 anni  
Storia: vuole acquistare una nuova smart-TV <u>all'avanguardia</u> per il suo salotto: deve trovare il <u>prezzo migliore</u> tra le migliori TV presenti nel negozio.

**Persona 2**: donna, studentessa universitaria, 20 anni  
Storia: vuole acquistare uno smartphone <u>economico</u> per sostituire quello vecchio e lento: deve trovare la <u>migliore soluzione costo-prestazioni</u>.  
  
**Persona 3**: donna, sposata, con figli, 60 anni  
Storia: vuole acquistare una radio per la madre di 85 anni che vive da sola, per tenerle compagnia.    
  
**Persona 4**: uomo, lavora da pochi anni, 28 anni  
Storia: vuole assemblare un PC da gioco all'avanguardia: vuole controllare l'andamento dei prezzi dei componenti a cui e' interessato.  

**Persona 5**: uomo, manager di un negozio, 45 anni  
Storia: deve <u>aggiungere al sito web un modello appena uscito</u> di un prodotto e <u>rimuoverne uno vecchio</u>, esaurito.  

**Persona 6**: donna, manager del negozio, 50 anni  
Storia: deve <u>registrare l'arrivo</u> di una serie di prodotti e <u>applicare uno sconto</u> per i prodotti di un modello specifico.

# Functional and non functional requirements

## Functional Requirements

| ID      | Descrizione                                                                        |
|:--------|:-----------------------------------------------------------------------------------|
| **FR1** | **Gestione degli accessi**                                                         |
| FR1.1   | Login di un utente registrato                                                      |
| FR1.2   | Logout di un utente registrato                                                     |
| FR1.3   | Possibilita' di ottenere le informazioni relative all'utente correntemente loggato |
| **FR2** | **Gestione degli utenti**                                                          |
| FR2.1   | Registrazione di un nuovo utente                                                   |
| **FR3** | **Gestione dei prodotti**                                                          |
| FR3.1   | Visualizzazione di tutti i prodotti                                                |
| FR3.2   | Aggiunta di un nuovo prodotto                                                      |
| FR3.3   | Rimozione di un prodotto                                                           |
| FR3.4   | Registrazione dell'arrivo di un nuovo (insieme di) prodotti                        |
| FR3.5   | Filtraggio di prodotti per categoria, modello e disponibilita'                     |
| FR3.6   | Catalogazione di un prodotto come venduto                                          |
| **FR4** | **Gestione del carrello**                                                          |
| FR4.1   | Visualizzazione del carrello attuale del cliente                                   |
| FR4.2   | Aggiunta di un prodotto al carrello attuale                                        |
| FR4.3   | Rimozione di un prodotto dal carrello attuale                                      |
| FR4.4   | Acquisto dei prodotti aggiunti al carrello attuale                                 |
| FR4.5   | Visualizzazione della cronologia dei carrelli acquistati dal cliente               |
| FR4.6   | Cancellazione del carrello                                                         |

## Non Functional Requirements

| ID    | Tipo (efficienza, affidabilita', ...) | Descrizione                                                                                                                                                                                                              | Si riferisce a  |
|:------|:-------------------------------------:|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------:|
| NFR1  | Efficienza                            | Il sistema deve rispondere entro 0,5 secondi da qualsiasi azione dell'utente (esclusi i tempi di caricamento delle pagine).                                                                                              |        /        |
| NFR2  | Efficienza                            | Le pagine Web devono essere caricate entro 6 secondi dall'ultima richiesta dell'utente (variabile in base alle condizioni della rete)                                                                                    | /               |
| NFR3  | Efficienza                            | Non e'richiesta alcuna installazione per l'utente, ogni funzionalita' deve essere accessibile dal sito web tramite un browser internet                                                                                   | /               |
| NFR4  | Sicurezza                             | Il trattamento dei dati dell'utente deve essere conforme al GDPR                                                                                                                                                         | /               |
| NFR5  | Sicurezza                             | Le funzionalita' legate alla gestione dei prodotti possono essere utilizzate solo dai manager                                                                                                                            | F3.(2, 3, 4, 6) |
| NFR6  | Sicurezza                             | Tutte le funzionalita' legate ai carrelli possono essere utilizzate solo dai clienti                                                                                                                                     | F4.x            |
| NFR7  | Usabilita'                            | I clienti non hanno bisogno di alcuna formazione                                                                                                                                                                         | /               |
| NFR8  | Usabilita'                            | I manager hanno bisogno al massimo di un'ora di formazione                                                                                                                                                               | /               |
| NFR9  | Affidabilita'                         | Il numero di malfunzionamenti all'anno deve essere inferiore a 2                                                                                                                                                         | /               |
| NFR10 | Affidabilita'                         | Il sito web non deve richiedere piu' di 1 sessione di manutenzione ogni 2 mesi                                                                                                                                           | /               |
| NFR11 | Affidabilita'                         | Una sessione di manutenzione non puo' durare piu' di 4 ore                                                                                                                                                               | /               |
| NFR12 | Affidabilita'                         | Ogni utente non deve segnalare piu' di 1 bug non precedentemente segnalato all'anno                                                                                                                                      | /               |
| NFR13 | Portabilita'                          | Il sito web deve essere accessibile dai seguenti browser (specificata la piu' vecchia versione supportata): Chrome (v: 79), Firefox (v: 72), Safari (v: 13.0.5), Opera (v: 65), Edge (v: 79), Samsung Internet (v: 11.2) | /               |




# Use case diagram and use cases

## Use case diagram

![useCaseDiagram](/img/diagrammaDeiCasiD'uso.png)


### Use case 1, UC1 Registrazione

| Actors Involved  |                                                              Cliente, Manager (Utente)        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | -- |
|  Post condition  |  L'utente risulta registrato correttamente nel sistema.  |
| Nominal Scenario |  L'utente inserisce tutti i dati richiesti (username, nome, cognome, password) per la registrazione e sceglie il ruolo con cui registrarsi nel sistema.        |
|     Variants     |               |
|    Exceptions    |  I dati inseriti non sono corretti o l'utente risulta gia' registrato, il sistema ritorna un errore e la registrazione non va a buon fine          |


|  Scenario 1.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | -- |
| Post condition |  L'utente risulta registrato correttamente nel sistema  |
|     Step#      |                                Description                                 |
|       1        |   L'utente inizia la procedura di registrazione al sistema.                                                         |
|       2        |                                                        Il sistema chiede i dati necessari per la registrazione                |
|      3      |                                                          L'utente inserisce i dati personali e il ruolo con cui registrarsi       |
|    4     |                                                           Il sistema salva i dati e viene creato il nuovo utente               |


### Use case 2, UC2 Login

| Actors Involved  |    Cliente/Manager (Utente)                                                             |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente e' registrato nel sistema |
|  Post condition  | L'utente risulta loggato |
| Nominal Scenario | L'utente inserisce username e password e accede al sistema    |
|     Variants     |                   |
|    Exceptions    | L'utente inserisce dati errati e viene ritornato un errore      |


|  Scenario 2.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  |L'utente e' registrato nel sistema |
| Post condition |L'utente risulta loggato  |
|     Step#      |                                Description                                 |
|       1        |  L'utente chiede di accedere al sistema                                                                          |
|       2        | Il sistema chiede username e password                                                                           |
|      3       |                                                         L'utente inserisce username a password         |
|      4      |                                                         Il sistema valida i dati        |
|      5      |                                                         L'utente risulta loggato        |


### Use case 3, UC3 Logout

| Actors Involved  |  Cliente/Manager (Utente)                                                                   |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente e' loggato |
|  Post condition  | Viene eseguito il logout   |
| Nominal Scenario | L'utente chiede al sistema di effettuare il logout e questo viene effettuato con successo      |
|     Variants     |                          |
|    Exceptions    |                             |


|  Scenario 3.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente e' loggato|
| Post condition |  Viene eseguito il logout   |
|     Step#      |                                Description                                 |
|       1        |                                                        L'utente chiede al sistema di effettuare il logout                   |
|       2        |                                                        Il sistema effettua il logout per l'utente                    |

### Use case 4, UC4 Visualizza tutti i prodotti

| Actors Involved  |  Cliente/Manager (Utente)                                                                    |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente e' loggato |
|  Post condition  | Vengono mostrati tutti i prodotti   |
| Nominal Scenario | L'utente chiede al sistema di visualizzare tutti i prodotti e gli vengono mostrati     |
|     Variants     |                          |
|    Exceptions    |                             |


|  Scenario 4.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente e' loggato|
| Post condition | Vengono mostrati tutti i prodotti   |
|     Step#      |                                Description                                 |
|       1        |                                                        L'utente chiede al sistema di visualizzare tutti i prodotti presenti               |
|       2        |                                                        Il sistema mostra tutti i prodotti presenti                   |

### Use case 5, UC5 Aggiungi nuovo prodotto

| Actors Involved  |  Manager                                                                    |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente e' loggato ed ha il ruolo Manager |
|  Post condition  | Il prodotto viene aggiunto correttamente   |
| Nominal Scenario | Il manager chiede di aggiungere un nuovo prodotto, inserisce tutti i dati richiesti e il prodotto viene aggiunto correttamente     |
|     Variants     |                          |
|    Exceptions    | Il prodotto e' gia' presente o la data di arrivo e' successiva a quella corrente                            |


|  Scenario 5.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente e' loggato ed ha il ruolo Manager|
| Post condition | Il prodotto viene aggiunto correttamente   |
|     Step#      |                                Description                                 |
|       1        |                                                        Il manager chiede di aggiungere un nuovo prodotto               |
|       2        |                                                        Il sistema chiede tutti i dati necessari per l'aggiunta                |
|3 | Il manager inserisce tutti i dati richiesti
|4 | Il sistema valida i dati e li salva
|5| Il prodotto viene aggiunto correttamente

### Use case 6, UC6 Rimuovi un prodotto

| Actors Involved  | Manager                                                                    |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente e' loggato ed ha il ruolo Manager |
|  Post condition  | Il prodotto viene rimosso    |
| Nominal Scenario | Il manager chiede al sistema di rimuovere un prodotto e questo viene rimosso correttamente    |
|     Variants     |                          |
|    Exceptions    |Il prodotto che si vuole rimuovere non e' presente, viene ritornato un errore                           |


|  Scenario 6.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente e' loggato ed ha il ruolo Manager|
| Post condition | Il prodotto viene rimosso  |
|     Step#      |                                Description                                 |
|       1        |                                                        Il manager chiede al sistema di rimuovere un prodotto            |
|       2        |                                                        Il sistema chiede il codice del prodotto che si vuole rimuovere                   |
|3| L'utente inserisce il codice
|4| Il sistema verifica che il codice sia presente 
|5| Il prodotto viene rimosso
### Use case 7, UC7 Registra arrivi

| Actors Involved  | Manager                                                                    |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente e' loggato ed ha il ruolo Manager |
|  Post condition  | Viene registrato correttamente l'arrivo di un set di prodotti   |
| Nominal Scenario | Il manager chiede al sistema di registrare l'arrivo di un set di prodotti dello stesso modello e vengono registrati correttamente    |
|     Variants     |                          |
|    Exceptions    |La data di arrivo e' successiva a quella corrente e viene mostrato un errore

|  Scenario 7.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente e' loggato ed ha il ruolo Manager|
| Post condition | Vengono registrati correttamente l'arrivo di un set di prodotti    |
|     Step#      |                                Description                                 |
|       1        |                                                        Il manager chiede al sistema di registrare l'arrivo di un set di prodotti           |
|       2        |                                                        Il sistema chiede i dati necessari per la registrazione dell'arrivo                  |
|3| L'utente inserisce i dati
|4| Il sistema valida i dati e li salva
|5| L'arrivo viene registrato correttamente


### Use case 8, UC8 Filtra prodotti

| Actors Involved  | Cliente/Manager (Utente)                                                                    |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente e' loggato  |
|  Post condition  | Vengono mostrati i prodotti che rispecchiano il filtro inserito dall'utente  |
| Nominal Scenario | L'utente chiede di visualizzare solo i prodotti che rispettano i criteri del filtro    |
|     Variants     |                          |
|    Exceptions    |

|  Scenario 8.1  |                                                                     Filtro per categoria       | 
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente e' loggato |
| Post condition | Vengono mostrati i prodotti che rispecchiano la categoria inserita dall'utente   |
|     Step#      |                                Description                                 |
|       1        |                                                        L'utente chiede di visualizzare i prodotti di una certa categoria          |
|       2        |                                                        Il sistema chiede la categoria             |
|3| L'utente inserisce la categoria
|4| Il sistema mostra i prodotti appartenenti alla categoria inserita dall'utente |


|  Scenario 8.2  |                                                                     Filtro per modello       | 
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente e' loggato |
| Post condition | Vengono mostrati i prodotti che rispecchiano il modello inserito dall'utente   |
|     Step#      |                                Description                                 |
|       1        |                                                        L'utente chiede di visualizzare i prodotti di un certo modello          |
|       2        |                                                        Il sistema chiede il modello            |
|3| L'utente inserisce il modello
|4| Il sistema mostra i prodotti con modello corrispondente a quello inserito dall'utente |

|  Scenario 8.3  |                                                                     Filtro per modello       | 
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente e' loggato |
| Post condition | Vengono mostrati i prodotti la cui disponibilita' e' stata specificata dall'utente   |
|     Step#      |                                Description                                 |
|       1        |                                                        L'utente chiede di visualizzare tutti i prodotti o solo quelli disponibili o solo quelli non disponibili          |
|2| Il sistema mostra i prodotti corrispondenti al criterio di filtraggio specificato dall'utente |

# Glossary

![glossary](./img/glossary.png)

# System Design


![system design](./img/SystemDesign.png)

# Deployment Diagram


![deployment Diagram](./img/DeploymentDiagram.png)