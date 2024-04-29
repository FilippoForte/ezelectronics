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

| Nome dello Stakeholder | Descrizione                                                                     |
| :--------------------: | :-----------------------------------------------------------------------------: |
| Cliente                | Individuo che accede al sito web per visualizzare o comprare prodotti           |
| Manager                | Manager dello store fisico che puo' gestire i prodotti sul sito                 |
| Sviluppatori           | Il team di sviluppatori del sistema                                             |
| Utente guest           | Utente che non ha ancora effettuato la fase di login o la fase di registrazione |

# Context Diagram and interfaces

## Context Diagram

![contextDiagram](./img/contextDiagramV1.png)

## Interfaces

| Attore           | Interfaccia logica                                                            | Interfaccia fisica |
| :--------------: | :--------------------------------------------------------------------------:  | :----------------: |
| Cliente          | GUI (interfaccia per navigare il sito, visualizzare e comprare prodotti)      | Smartphone / PC    |
| Manager          | GUI (interfaccia per navigare il sito, visualizzare e gestire i prodotti)     | Smartphone / PC    |
| Utente guest     | GUI (interfaccia per registrarsi o loggarsi nel sito)                         | Smartphone / PC    |

# Stories and personas

**Persona 1**: uomo, professionista ad alto reddito, sposato, con figli, 50 anni  
Storia: vuole acquistare una nuova smart-TV <u>all'avanguardia</u> per il suo salotto: deve trovare il <u>prezzo migliore</u> tra le migliori TV presenti nel negozio.

**Persona 2**: donna, studentessa universitaria, 20 anni  
Storia: vuole acquistare uno smartphone <u>economico</u> per sostituire quello vecchio e lento: deve trovare la <u>migliore soluzione costo-prestazioni</u>.  
  
**Persona 3**: donna, sposata, con figli, 60 anni  
Storia: vuole acquistare una radio per la madre di 85 anni che vive da sola, per tenerle compagnia.
  
**Persona 4**: uomo, lavora da pochi anni, 28 anni  
Storia: vuole assemblare un PC da gioco all'avanguardia: vuole controllare i prezzi dei componenti a cui e' interessato.  

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
| FR1.3   | Possibilità di ottenere le informazioni relative all'utente correntemente loggato |
| **FR2** | **Gestione degli utenti**                                                          |
| FR2.1   | Registrazione di un nuovo utente                                                   |
| **FR3** | **Gestione dei prodotti**                                                          |
| FR3.1   | Visualizzazione di tutti i prodotti                                                |
| FR3.2   | Aggiunta di un nuovo prodotto                                                      |
| FR3.3   | Rimozione di un prodotto                                                           |
| FR3.4   | Registrazione dell'arrivo di un nuovo (insieme di) prodotti                        |
| FR3.5   | Filtraggio (e visualizzazione) di prodotti per categoria, modello, codice e disponibilita'|
| FR3.6   | Catalogazione di un prodotto come venduto                                          |
| **FR4** | **Gestione del carrello**                                                          |
| FR4.1   | Visualizzazione del carrello attuale del cliente                                   |
| FR4.2   | Aggiunta di un prodotto al carrello attuale                                        |
| FR4.3   | Rimozione di un prodotto dal carrello attuale                                      |
| FR4.4   | Acquisto dei prodotti aggiunti al carrello attuale                                 |
| FR4.5   | Visualizzazione dello storico dei carrelli acquistati dal cliente                  |
| FR4.6   | Cancellazione del carrello                                                         |

## Non Functional Requirements

| ID    | Tipo (efficienza, affidabilita', ...) | Descrizione                                                                                                                                                                                                              | Si riferisce a  |
|:------|:-------------------------------------:|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------:|
| NFR1  | Efficienza                            | Non è richiesta alcuna installazione per l'utente, ogni funzionalità deve essere accessibile dal sito web tramite un browser internet                                                                                    | /               |
| NFR2  | Usabilita'                            | I clienti non hanno bisogno di alcuna formazione                                                                                                                                                                         | /               |
| NFR3  | Usabilita'                            | I manager hanno bisogno di un massimo di tre ore di formazione                                                                                                                                                           | /               |
| NFR4 | Affidabilita'                         | Il sistema deve avere un uptime del 99%                                                                                                                                                                                  | /               |

# Use case diagram and use cases

## Use case diagram

![useCaseDiagram](/img/diagrammaCasiDuso.png)

### Use case 1.1, UC1.1 Login

| Actors Involved  |    Utente                                          |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è registrato nel sistema |
|  Post condition  | L'utente risulta loggato |
| Nominal Scenario | L'utente inserisce username e password e accede al sistema (1.1)   |
|     Variants     |                   |
|    Exceptions    | L'utente inserisce dati errati (non previsto dalle API, ma presente nel file userDAO.ts)  (1.1.1)   |

##### Scenario 1.1

|  Scenario 1.1  | Login corretto                                                                       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  |L'utente è registrato nel sistema |
| Post condition |L'utente risulta loggato  |
|     Step#      |                                Description                                 |
|       1        |  L'utente chiede di accedere al sistema                                                                          |
|       2        | Il sistema chiede username e password                                                                           |
|      3       |                                                         L'utente inserisce username a password         |
|      4      |                                                         Il sistema valida i dati        |
|      5      |                                                         L'utente risulta loggato        |
##### Scenario 1.1.1

|  Scenario 1.1.1  |  Login errato                                                                         |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  |L'utente è registrato nel sistema |
| Post condition |  |
|     Step#      |                                Description                                 |
|       1        |  L'utente chiede di accedere al sistema                                                                          |
|       2        | Il sistema chiede username e password                                                                           |
|      3       |                                                         L'utente inserisce username a password         |
|      4      | Il sistema rileva un errore nei dati e lo comunica all'utente   |
|      

### Use case 1.2, UC1.2 Logout

| Actors Involved  |  Utente                                            |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è loggato |
|  Post condition  | Viene eseguito il logout   |
| Nominal Scenario | L'utente chiede al sistema di effettuare il logout e questo viene effettuato con successo      |
|     Variants     |                          |
|    Exceptions    |                             |

##### Scenario 1.2

|  Scenario 1.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è loggato|
| Post condition |  Viene eseguito il logout   |
|     Step#      |                                Description                                 |
|       1        |                                                        L'utente chiede al sistema di effettuare il logout                   |
|       2        |                                                        Il sistema effettua il logout per l'utente                    |

### Use case 1.3, UC1.3 Possibilità di ottenere le informazioni relative all'utente correntemente loggato

| Actors Involved  |  Utente                                                                    |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è loggato |
|  Post condition  | Vengono mostrate le informazioni dell'utente attualmente loggato   |
| Nominal Scenario | L'utente chiede al sistema di visualizzare le sue informazioni e li vengono mostrate      |
|     Variants     |                          |
|    Exceptions    |                             |

##### Scenario 1.3

|  Scenario 1.3  |                                  |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è loggato|
| Post condition |  Vengono mostrate le informazioni dell'utente attualmente loggato   |
|     Step#      |                                Description                                 |
|       1        |                                                        L'utente chiede al sistema di mostrare le sue informazioni                   |
|       2        |                                                        Il sistema mostra le informazioni all'utente                 |

### Use case 2.1 , UC2.1 Registrazione

| Actors Involved  |                                                              Utente guest     |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | -- |
|  Post condition  |  L'utente risulta registrato correttamente nel sistema.  |
| Nominal Scenario |  L'utente inserisce tutti i dati richiesti per la registrazione e sceglie il ruolo con cui registrarsi nel sistema.  (2.1)     |
|     Variants     |        |
|    Exceptions    | L'utente risulta già registrato  (2.1.1)       |

##### Scenario 2.1

|  Scenario 2.1  |  Registrazione corretta                                                                        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | -- |
| Post condition |  L'utente/manager risulta registrato correttamente nel sistema  |
|     Step#      |                                Description                                 |
|       1        |   L'utente chiede di registrarsi al sistema.                                                         |
|       2        |                                                        Il sistema chiede i dati necessari per la registrazione                |
|      3      |                                                          L'utente inserisce i dati richiesti       |
|       4      |                                                          L'utente seleziona il ruolo con cui registrarsi(manager o utente)             |
|    5     |                                                           Il sistema salva i dati e viene creato il nuovo utente/manager               |
##### Scenario 2.1.1

|  Scenario 2.1.1  |   Registrazione errata                                                                       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | -- |
| Post condition |   |
|     Step#      |                                Description                                 |
|       1        |   L'utente chiede di registrarsi al sistema.                                                         |
|       2        |                                                        Il sistema chiede i dati necessari per la registrazione                |
|      3      |                                                          L'utente inserisce i dati richiesti       |
|       4      |                                                          L'utente seleziona il ruolo con cui registrarsi(manager o utente)             |
|    5     | Il sistema rileva un errore in quanto l'username dell'utente esiste già e lo comunica all'utente   |
### Use case 3.1, UC3.1 Visualizza tutti i prodotti

| Actors Involved  |  Utente/Manager                                                                    |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è loggato |
|  Post condition  | Vengono mostrati tutti i prodotti   |
| Nominal Scenario | L'utente chiede al sistema di visualizzare tutti i prodotti e li vengono mostrati     |
|     Variants     |                          |
|    Exceptions    |                             |

##### Scenario 3.1

|  Scenario 3.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è loggato|
| Post condition | Vengono mostrati tutti i prodotti   |
|     Step#      |                                Description                                 |
|       1        |                                                        L'utente chiede al sistema di visualizzare tutti i prodotti presenti               |
|       2        |                                                        Il sistema mostra tutti i prodotti presenti                   |

### Use case 3.2, UC3.2 Aggiungi nuovo prodotto

| Actors Involved  |  Manager                                                                    |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è loggato ed ha il ruolo Manager |
|  Post condition  | Il prodotto viene aggiunto correttamente   |
| Nominal Scenario | Il manager chiede di aggiungere un nuovo prodotto, inserisce tutti i dati richiesti e il prodotto viene aggiunto correttamente  (3.2)   |
|     Variants     |                          |
|    Exceptions    | Il prodotto è già presente (3.2.1) o la data di arrivo è successiva a quella corrente (3.2.2)                     |

##### Scenario 3.2

|  Scenario 3.2  | Aggiunta corretta di un nuovo prodotto                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è loggato ed ha il ruolo Manager|
| Post condition | Il prodotto viene aggiunto correttamente   |
|     Step#      |                                Description                                 |
|       1        |                                                        Il manager chiede di aggiungere un nuovo prodotto               |
|       2        |                                                        Il sistema chiede tutti i dati necessari per l'aggiunta                |
|3 | Il manager inserisce tutti i dati richiesti
|4 | Il sistema valida i dati e li salva
|5| Il prodotto viene aggiunto correttamente
##### Scenario 3.2.1

|  Scenario 3.2.1  | Aggiunta errata di un nuovo prodotto (prodotto esistente)                                                                           |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è loggato ed ha il ruolo Manager|
| Post condition |   |
|     Step#      |                                Description                                 |
|       1        |                                                        Il manager chiede di aggiungere un nuovo prodotto               |
|       2        |                                                        Il sistema chiede tutti i dati necessari per l'aggiunta                |
|3 | Il manager inserisce tutti i dati richiesti
|4 | Il sistema rileva un errore in quanto il prodotto è già esistente e lo comunica all'utente
##### Scenario 3.2.2

|  Scenario 3.2.2 | Aggiunta errata di un nuovo prodotto (data di arrivo successiva alla data corrente)                                                                          |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è loggato ed ha il ruolo Manager|
| Post condition | Il prodotto viene aggiunto correttamente   |
|     Step#      |                                Description                                 |
|       1        |                                                        Il manager chiede di aggiungere un nuovo prodotto               |
|       2        |                                                        Il sistema chiede tutti i dati necessari per l'aggiunta                |
|3 | Il manager inserisce tutti i dati richiesti
|4 | Il sistema rileva un errore in quanto la data di arrivo è successiva a quella corrente e lo comunica all'utente
### Use case 3.3, UC3.3 Rimozione di un prodotto

| Actors Involved  | Manager                                                                    |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è loggato ed ha il ruolo Manager |
|  Post condition  | Il prodotto viene rimosso    |
| Nominal Scenario | Il manager chiede al sistema di rimuovere un prodotto e questo viene rimosso correttamente (3.3)   |
|     Variants     |                          |
|    Exceptions    |Il prodotto che si vuole rimuovere non è presente (3.3.1)  |

##### Scenario 3.3

|  Scenario 3.3  | Rimozione corretta  |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è loggato ed ha il ruolo Manager|
| Post condition | Il prodotto viene rimosso  |
|     Step#      |                                Description                                 |
|       1        |                                                        Il manager chiede al sistema di rimuovere un prodotto            |
|       2        |                                                        Il sistema chiede il codice del prodotto che si vuole rimuovere                   |
|3| L'utente inserisce il codice
|4| Il sistema verifica che il codice sia presente
|5| Il prodotto viene rimosso
##### Scenario 3.3.1

|  Scenario 3.3.1  |Rimozione errata   |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è loggato ed ha il ruolo Manager|
| Post condition | |
|     Step#      |                                Description                                 |
|       1        |                                                        Il manager chiede al sistema di rimuovere un prodotto            |
|       2        |                                                        Il sistema chiede il codice del prodotto che si vuole rimuovere                   |
|3| L'utente inserisce il codice
|4| Il sistema rileva un errore in quanto il prodotto non risulta presente e lo comunica all'utente
### Use case 3.4, UC3.4 Registrazione dell'arrivo di un nuovo (insieme di) prodotto/i

| Actors Involved  | Manager                                                                    |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è loggato ed ha il ruolo Manager |
|  Post condition  | Vengono registrati correttamente l'arrivo di un set di prodotti   |
| Nominal Scenario | Il manager chiede al sistema di registrare l'arrivo di un set di prodotti dello stesso modello e vengono registrati correttamente (3.4)   |
|     Variants     |                          |
|    Exceptions    |La data di arrivo è successiva a quella corrente (3.4.1)

##### Scenario 3.4

|  Scenario 3.4 |  Registrazione arrivi corretta                                                                          |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è loggato ed ha il ruolo Manager|
| Post condition | Vengono registrati correttamente l'arrivo di un set di prodotti    |
|     Step#      |                                Description                                 |
|       1        |                                                        Il manager chiede al sistema di registrare l'arrivo di un set di prodotti           |
|       2        |                                                        Il sistema i dati necessari per la registrazione di un arrivo                   |
|3| L'utente inserisce i dati
|4| Il sistema valida i dati e li salva
|5| L'arrivo viene registrato correttamente
##### Scenario 3.4.1

|  Scenario 3.4.1 |  Registrazione arrivi errata                                                                          |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è loggato ed ha il ruolo Manager|
| Post condition |     |
|     Step#      |                                Description                                 |
|       1        |                                                        Il manager chiede al sistema di registrare l'arrivo di un set di prodotti           |
|       2        |                                                        Il sistema i dati necessari per la registrazione di un arrivo                   |
|3| L'utente inserisce i dati
|4| Il sistema rileva un errore in quanto la data di arrivo è successiva a quella corrente e lo comunica all'utente
### Use case 3.5, UC3.5 Filtraggio di prodotti per categoria, modello, codice e disponibilità

| Actors Involved  | Utente/Manager                                                                    |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è loggato  |
|  Post condition  | Vengono mostrati i prodotti che rispecchiano il filtro inserito dall'utente  |
| Nominal Scenario | L'utente chiede di visualizzare solo i prodotti che rispecchiano un determinato filtro    |
|     Variants     |                          |
|    Exceptions    |

##### Scenario 3.5

|  Scenario 3.5  |                                                                     Filtraggio di prodotti per categoria, modello, codice e disponibilità       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è loggato |
| Post condition | Vengono mostrati i prodotti che rispecchiano il filtro inserito dall'utente   |
|     Step#      |                                Description                                 |
|       1        |                                                        L'utente chiede di visualizzare i prodotti che rispecchiano un determinato filtro          |
|       2        |                                                        Il sistema chiede il filtro             |
|3| L'utente inserisce il filtro
|4| Il sistema mostra i prodotti appartenenti al filtro inserito dall'utente

### Use case 3.6, UC3.6 Cataloga prodotto come venduto

| Actors Involved  |Manager                                                                    |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | Il manager è loggato  |
|  Post condition  | Il prodotto viene catalogato come venduto  |
| Nominal Scenario | Il manager chiede di catalogare un prodotto come venduto (3.6)  |
|     Variants     |                          |
|    Exceptions    | Il prodotto non esiste (3.6.1), la data di vendita risulta precedente alla data di arrivo o successiva a quella corrente (3.6.2) o il prodotto risulta già venduto (3.6.3)

##### Scenario 3.6

|  Scenario 3.6  |                                                                    Catalogazione corretta del prodotto come venduto    |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il manager è loggato |
| Post condition | Il prodotto viene catalogato come venduto    |
|     Step#      |                                Description                                 |
|       1        |                                                      Il manager seleziona il prodotto che vuole catalogare come venduto e inserisce la data di vendita        |
|       2        |                                           Il sistema valida le informazioni          |
|3| Il prodotto risulta venduto
##### Scenario 3.6.1

|  Scenario 3.6.1  |                                                                    Catalogazione errata del prodotto come venduto    |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il manager è loggato |
| Post condition | Il prodotto viene catalogato come venduto    |
|     Step#      |                                Description                                 |
|       1        |                                                      Il manager seleziona il prodotto che vuole catalogare come venduto e inserisce la data di vendita        |
|       2        |  Il sistema rileva un errore in quanto il prodotto non esiste e lo comunica al manager
##### Scenario 3.6.2

|  Scenario 3.6.2  |                                                                    Catalogazione errata del prodotto come venduto    |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il manager è loggato |
| Post condition | Il prodotto viene catalogato come venduto    |
|     Step#      |                                Description                                 |
|       1        |                                                      Il manager seleziona il prodotto che vuole catalogare come venduto e inserisce la data di vendita        |
|       2        |Il sistema rileva un errore in quanto la data di vendita risulta precedente alla data di arrivo o successiva a quella corrente e lo comunica al manager  
##### Scenario 3.6.3

|  Scenario 3.6.3  |                                                                    Catalogazione errata del prodotto come venduto    |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il manager è loggato |
| Post condition | Il prodotto viene catalogato come venduto    |
|     Step#      |                                Description                                 |
|       1        |                                                      Il manager seleziona il prodotto che vuole catalogare come venduto e inserisce la data di vendita        |
|       2        |  Il sistema rileva un errore in quanto il prodotto risulta già venduto e lo comunica al manager

### Use case 4.1, UC4.1  Visualizzazione del carrello attuale del cliente  

| Actors Involved  | Cliente                                                                   |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | Il cliente è loggato  |
|  Post condition  | Viene mostrato il carrello attuale del cliente loggato  |
| Nominal Scenario | Il cliente chiede di visualizzare il suo carrello attuale e viene mostrato    |
|     Variants     |                          |
|    Exceptions    |

##### Scenario 4.1

|  Scenario 4.1  |                                                                     Visualizzazione del carrello attuale del cliente     |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition |Viene mostrato il carrello attuale del cliente loggato   |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente chiede di visualizzare il suo carrello attuale          |
|       2        |                                                        Il sistema mostra il carrello corrente|

### Use case 4.2, UC4.2 Aggiunta di un prodotto al carrello attuale

| Actors Involved  | Cliente                                                                   |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | Il cliente è loggato  |
|  Post condition  | Il prodotto viene aggiunto correttamente al carrello attuale  |
| Nominal Scenario | Il cliente chiede di aggiungere un prodotto al suo carrello e questo viene aggiunto correttamente  (4.2) |
|     Variants     |                          |
|    Exceptions    | Il prodotto non esiste (4.2.1), il prodotto è già presente in un altro carrello (4.2.2) o il prodotto non è disponibile (4.2.3)|

##### Scenario 4.2

|  Scenario 4.2  |                                                                     Aggiunta corretta di un prodotto al carrello attuale    |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition |Il prodotto viene aggiunto correttamente al carrello  |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente seleziona il prodotto da aggiungere al carrello          |
|       2        |                                                        Il sistema verifica che il prodotto possa essere aggiunto |
|3| Il prodotto risulta aggiunto al carrello|
##### Scenario 4.2.1

|  Scenario 4.2.1  |                                                                     Aggiunta errata di un prodotto al carrello attuale    |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition |  |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente seleziona il prodotto da aggiungere al carrello          |
|       2        |                                                        Il sistema rileva un errore in quanto il prodotto non è esistente e lo comunica al cliente
##### Scenario 4.2.2

|  Scenario 4.2.2  |                                                                     Aggiunta errata di un prodotto al carrello attuale    |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition |  |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente seleziona il prodotto da aggiungere al carrello          |
|       2        |                                                        Il sistema rileva un errore in quanto il prodotto risulta essere presente in un altro carrello e lo comunica al cliente
##### Scenario 4.2.3

|  Scenario 4.2.3  |                                                                     Aggiunta errata di un prodotto al carrello attuale    |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition | |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente seleziona il prodotto da aggiungere al carrello          |
|       2        |                                                        Il sistema rileva un errore in quanto il prodotto risulta venduto (non disponibile) e lo comunica al cliente
### Use case 4.3, UC4.3 Rimozione di un prodotto dal carrello attuale

| Actors Involved  | Cliente                                                                   |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | Il cliente è loggato  |
|  Post condition  | Il prodotto viene rimosso dal carrello  |
| Nominal Scenario | Il cliente chiede di rimuovere un prodotto dal carrello e questo viene rimosso correttamente (4.3)  |
|     Variants     |                          |
|    Exceptions    | Il prodotto non è nel carrello (4.3.1), non esiste (4.3.2), è già stato venduto (4.3.3) o il cliente non ha alcun carrello (4.3.4)

##### Scenario 4.3

|  Scenario 4.3  |                                                                     Rimozione corretta di un prodotto dal carrello attuale     |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition | Il prodotto viene rimosso dal carrello   |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente chiede di rimuovere un prodotto dal suo carrello         |
|       2        |                                                        Il sistema verifica che il prodotto sia rimovibile|
|3| Il prodotto risulta rimosso correttamente
##### Scenario 4.3.1

|  Scenario 4.3.1  |                                                                     Rimozione errata di un prodotto dal carrello attuale     |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition |   |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente chiede di rimuovere un prodotto dal suo carrello         |
|       2        |                                                        Il sistema rileva un errore in quanto il prodotto non è nel carrello e lo comunica all'utente
##### Scenario 4.3.2

|  Scenario 4.3.2  |                                                                     Rimozione errata di un prodotto dal carrello attuale     |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition |  |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente chiede di rimuovere un prodotto dal suo carrello         |
|       2        |                                                        Il sistema rileva un errore in quanto il prodotto non esiste e lo comunica all'utente
##### Scenario 4.3.3

|  Scenario 4.3.3  |                                                                     Rimozione errata di un prodotto dal carrello attuale     |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition |   |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente chiede di rimuovere un prodotto dal suo carrello         |
|       2        |  Il sistema rileva un errore in quanto il prodotto è già stato venduto e lo comunica all'utente
##### Scenario 4.3.4

|  Scenario 4.3.4  |                                                                     Rimozione errata di un prodotto dal carrello attuale     |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition |  |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente chiede di rimuovere un prodotto dal suo carrello         |
|       2        | Il sistema rileva un errore in quanto il cliente non ha alcun carrello e lo comunica all'utente

### Use case 4.4, UC4.4 Acquisto dei prodotti aggiunti al carrello attuale

| Actors Involved  | Cliente                                                                   |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | Il cliente è loggato  |
|  Post condition  | L'acquisto del carrello viene effettuato correttamente  |
| Nominal Scenario | Il cliente chiede di acquistare il carrello attuale e questo viene eseguito correttamente (4.4) |
|     Variants     |                          |
|    Exceptions    | Il carrello è vuoto (4.4.1), o non esiste alcun carrello per il cliente loggato (4.4.2)

##### Scenario 4.4

|  Scenario 4.4  |                                                                    Acquisto corretto dei prodotti aggiunti al carrello attuale    |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition |L'acquisto del carrello viene effettuato correttamente    |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente chiede di acquistare i prodotti presenti nel suo carrello attuale          |
|       2        |                                                        Il sistema verifica che la richiesta sia valida|
|3| Il sistema calcola il totale del carrello e imposta la data di pagamento
|4| Il carrello risulta acquistato
##### Scenario 4.4.1

|  Scenario 4.4.1  |                                                                    Acquisto errato dei prodotti aggiunti al carrello attuale    |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition |  |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente chiede di acquistare i prodotti presenti nel suo carrello attuale          |
|       2        | Il sistema rileva un errore in quanto il carrello risulta vuoto e lo comunica al cliente
##### Scenario 4.4.2

|  Scenario 4.4.2  |                                                                    Acquisto errato dei prodotti aggiunti al carrello attuale    |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition |    |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente chiede di acquistare i prodotti presenti nel suo carrello attuale          |
|       2        | Il sistema rileva un errore in quanto il cliente non risulta avere alcun carrello e lo comunica al cliente
### Use case 4.5 , UC4.5 Visualizzazione della cronologia dei carrelli acquistati dal cliente

| Actors Involved  | Cliente                                                                   |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | Il cliente è loggato  |
|  Post condition  | Vengono mostrati tutti i carrelli del cliente loggato  |
| Nominal Scenario | Il cliente chiede di visualizzare la storia dei suoi carrelli    |
|     Variants     |                          |
|    Exceptions    |

##### Scenario 4.5

|  Scenario 4.5  |                                                                     Visualizzazione della cronologia dei carrelli     |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition | Vengono mostrati tutti i carrelli del cliente loggato   |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente chiede di visualizzare la storia dei suoi carrelli          |
|       2        |                                                        Il sistema mostra la storia dei carrelli del cliente|

### Use case 4.6 , UC4.6 Cancellazione del carrello

| Actors Involved  | Cliente                                                                   |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | Il cliente è loggato  |
|  Post condition  | Viene cancellato il carrello attuale del cliente loggato  |
| Nominal Scenario | Il cliente chiede di cancellare il suo carrello attuale e viene cancellato correttamente (4.6) |
|     Variants     |                          |
|    Exceptions    | Il cliente non ha alcun carrello (4.6.1)

##### Scenario 4.6

|  Scenario 4.6  |                                                                     Cancellazione corretta del carrello attuale del cliente     |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition |Viene cancellato il carrello attuale del cliente loggato   |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente chiede di cancellare il suo carrello attuale          |
|       2        |                                                        Il sistema elimina il carrello corrente|
##### Scenario 4.6.1

|  Scenario 4.6.1 |                                                                     Cancellazione errata del carrello attuale del cliente     |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il cliente è loggato |
| Post condition | |
|     Step#      |                                Description                                 |
|       1        |                                                        Il cliente chiede di cancellare il suo carrello attuale          |
|       2        | Il sistema rileva un errore in quanto non esiste alcun carrello del cliente e lo comunica al cliente
# Glossary
- Utente
  - Persona registrata al sistema
  - Può visualizzare i prodotti
  - Può avere ruolo di cliente o di manager
- Cliente 
  - Utente che dispone di un carrello in cui inserire i prodotti che vuole acquistare
  - Può visualizzare lo storico dei carrelli per cui ha pagato, quindi possiede almeno un carrello (quello corrente) ed eventualmente tutti quelli acquistati precedentemente
- Manager 
  - Utente responsabile del negozio fisico
  - Ogni manager ha la possibilità di gestire (aggiungere, rimuovere, registrare una nuova fornitura, ...) i prodotti sul sito web
- Prodotto
  - Prodotto in vendita sul sito web
  - Ogni singolo prodotto ha un codice univoco
  - Ogni prodotto viene aggiunto da un manager al sito web
- Carrello
  - Ogni carrello è proprietà di un singolo cliente
  - Contiene i prodotti in esso inseriti dal cliente proprietario

![glossary](./img/glossaryV1.png)

# System Design

![system design](./img/SystemDesign.png)

# Deployment Diagram

![deployment Diagram](./img/DeploymentDiagram.png)
