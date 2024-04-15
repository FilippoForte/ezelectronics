# Requirements Document - current EZElectronics

Date:

Version: V1 - description of EZElectronics in CURRENT form (as received by teachers)

| Version number | Change |
| :------------: | :----: |
|                |        |

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

| Stakeholder name | Description                                                              |
| :--------------: | :----------------------------------------------------------------------: |
| Customer         | Individual who wants to buy something                                    |
| Manager          | Manager who provides products to the company and manages the application |
| Banking service  | Service for monetary transactions                                        |
| Developers       | Group that created the application                                       |
| Shipping service | Service for the shipment of products to the user                         |

# Context Diagram and interfaces

## Context Diagram

![contextDiagram](/contextDiagram.png)

## Interfaces

|   Actor          | Logical Interface                                        | Physical Interface |
| :--------------: | :------------------------------------------------------: | :----------------: |
| Customer         | GUI (interface for viewing products and purchasing)      | Smartphone / PC    |
| Manager          | GUI (interface for view, add products and control users) | Smartphone / PC    |
| Banking service  | APIs                                                     | Internet           |
| Shipping service | APIs                                                     | Internet           |

# Stories and personas

**Persona 1**: male, high-income professional, married, with children, 50 years-old  
Story: wants to purchase a new, <u>state-of-the-art</u> smart-TV for his living room: needs to find the <u>best price/discount</u> among different stores.  

**Persona 2**: female, undergraduate, 20 years-old  
Story: wants to purchase a <u>cheap</u> smartphone to replace her old and slow one: needs to find the <u>best cost-performance solution</u>.  
  
**Persona 3**: female, married, with children, 60 years-old  
Story: wants to purchase a radio for her 85 year-old mother who lives alone, to keep her company.    
  
**Persona 4**: male, has been working for a few years, 28 years-old  
Story: wants to build a cutting-edge gaming PC: needs to find the best prices for all the components, might buy <u>different items from different stores</u>.  

**Persona 5**: male, store manager, 45 years-old  
Story: needs to <u>add a newly released model</u> of a product to the website and <u>remove an old</u>, out-of-stock one.  

**Persona 6**: female, store manager, 40 years-old  
Story: needs to <u>retrieve customer data</u> for profiling goals.

**Persona 7**: male, store manager, 50 years-old  
Story: needs to <u>register the arrival</u> of a set of products and <u>apply a discount</u> for the products of a specific model.

# Functional and non functional requirements

## Functional Requirements

\<In the form DO SOMETHING, or VERB NOUN, describe high level capabilities of the system>

\<they match to high level use cases>

|  ID   | Description |
| :---: | :---------: |
|  FR1  |             |
|  FR2  |             |
| FRx.. |             |

## Non Functional Requirements

\<Describe constraints on functional requirements>

|   ID    | Type (efficiency, reliability, ..) | Description | Refers to |
| :-----: | :--------------------------------: | :---------: | :-------: |
|  NFR1   |                                    |             |           |
|  NFR2   |                                    |             |           |
|  NFR3   |                                    |             |           |
| NFRx .. |                                    |             |           |

# Use case diagram and use cases

## Use case diagram

\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>

\<next describe here each use case in the UCD>

### Use case 1, UC1

| Actors Involved  |                                                                      |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | \<Boolean expression, must evaluate to true before the UC can start> |
|  Post condition  |  \<Boolean expression, must evaluate to true after UC is finished>   |
| Nominal Scenario |         \<Textual description of actions executed by the UC>         |
|     Variants     |                      \<other normal executions>                      |
|    Exceptions    |                        \<exceptions, errors >                        |

##### Scenario 1.1

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

|  Scenario 1.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | \<Boolean expression, must evaluate to true before the scenario can start> |
| Post condition |  \<Boolean expression, must evaluate to true after scenario is finished>   |
|     Step#      |                                Description                                 |
|       1        |                                                                            |
|       2        |                                                                            |
|      ...       |                                                                            |

##### Scenario 1.2

##### Scenario 1.x

### Use case 2, UC2

..

### Use case x, UCx

..

# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships>

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design

\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram

\<describe here deployment diagram >
