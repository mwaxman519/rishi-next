**Rishi Business Overview and Solution Architecture**

### **1. Business Overview and Operational Requirements**

#### **1.1 Business Overview**

Rishi operates in the **legal cannabis industry**, offering **white-label staffing, marketing support, brand representation, merchandising**, and **logistics** services for cannabis brands. The company provides on-site representation at **dispensaries, trade shows, and events**, primarily focusing on promotional activities and brand engagement within the cannabis space. Rishi operates mostly in **California**, with some activities in **Michigan and Arizona**, but is aiming for **national presence** with centralized management and regionally distributed operations.

Rishi's business model is structured to provide flexibility and scalability, managing teams of **regional managers** and **brand agents** who execute events and activities across different territories. The core services include **staffing events**, **logistics**, **merchandising**, and **mystery shopping**, with brand agents utilizing **marketing kits** provided by the clients. **Logistics managers** are involved in coordinating these kit movements, especially in larger operational regions.

#### **1.2 Key Business Model Elements**

##### **1.2.1 Regional Management and Staffing Structure**

- Rishi’s operations are structured by **states** and **regions** within each state.
- **Brand agents** are assigned to operate in specific regions, supporting brand activities within those areas.
- **Regional managers** oversee the agents and logistics in their respective regions, helping to coordinate staffing and resource allocation.

##### **1.2.2 Brand and Client Engagement**

- Rishi’s clients can be **single-brand, multi-brand**, or **distributors**.
- Each **brand** can operate in one or multiple states and is assigned to specific regions.
- Rishi manages a **master list of dispensaries**, assigning each to a region based on proximity and collecting pertinent contact and operational information about them.

##### **1.2.3 Kit Management and Tracking**

- Rishi provides **marketing kits** consisting of items such as hats, stickers, and banners. Each kit is assigned a unique ID and categorized by **kit template**.
- **Kit templates** define the contents of each type of kit, with different versions available based on event types and brand requirements.
- Kits are tracked for **location**, **contents**, and **replenishment needs**, supporting clients in planning their branding activities more effectively.

##### **1.2.4 Assignable Activities**

- Rishi performs a range of **assignable activities**, including:
  - **Events**: Promotions, trade show demonstrations, and in-store pop-ups.
  - **Merchandising**: Setting up displays, restocking, and rotating promotional materials in stores.
  - **Logistics**: Internal transfers of kits or promotional materials from one team member or region to another.
  - **Internal Kit Movements**: Handling the physical movement of marketing kits between agents.
  - **Secret Shopping**: Evaluating product presentation or competitor operations.
- These activities are grouped under a unified system, allowing consistent assignment, tracking, and reporting.

##### **1.2.5 Client Portal and Self-Service**

- Rishi plans to replace existing **SharePoint sites** with a **Power Pages client portal**. This portal will serve as a centralized platform where clients can:
  - **Request events** and other activities.
  - **View training materials** and **entitlement balances**.
  - **Review performance reports** and **billing information**.

##### **1.2.6 Learning Management and Certification**

- Clients provide **training materials**, which Rishi manages through a **Learning Management System (LMS)**.
- Brand agents must complete **courses** and pass **quizzes** to gain certification, which is required to be eligible for specific assignments.
- **Progress tracking** and **certification** ensure that agents are fully prepared for the brand they are representing.

##### **1.2.7 Human Resources and Performance Management**

- Rishi incorporates **HR functions** within the Power Apps system to manage brand agent profiles, including:
  - **Employee profiles**, **regional assignments**, **performance reviews**, and **expense reporting**.
  - **Agent activation/deactivation**, **review management**, and **expense approvals**.
  - The system includes tracking of agent **performance reviews** and **reimbursements** for expenses.

#### **1.3 Operational Requirements**

##### **1.3.1 Scheduling and Staffing**

- Rishi manages **event assignments**, ensuring that agents are assigned based on **availability**, **certification**, and **regional location**.
- Events can be **single or recurring**, with recurring setups simplifying the client’s ability to book consistent activities over time.
- Agents confirm their availability and receive assignments via the Canvas App.

##### **1.3.2 Entitlement-Based Billing**

- Clients pre-purchase a set of **entitlement hours** monthly based on anticipated workloads.
- Entitlements are tracked for every activity (e.g., events, merchandising), and billing is adjusted for any **overages** or **unused credits**.
- Entitlement usage is calculated based on clock-in/out times recorded by brand agents.

##### **1.3.3 Real-Time Communication**

- Rishi uses **Twilio integration** for SMS messaging to communicate with brand agents. Management can send event updates, and agents can confirm attendance or request assistance.
- All communication is logged, providing a complete message history for management and agents.

##### **1.3.4 Data Migration and Solution Scalability**

- The solution is designed for **scalability**, with plans to migrate data from existing SharePoint solutions to Power Platform.
- Rishi also envisions **white-labeling** the Power Apps solution for clients who may want to adopt the system in-house as their operations grow.

### **2. Solution Architecture for Rishi Power Apps Solution**

#### **2.1 Overview**

The Rishi Power Apps solution is designed to meet the company’s operational needs, supporting **event management**, **staffing**, **kit tracking**, **assignable activities**, **HR functionalities**, **training management**, and **billing**. The solution is built around three core applications:

1. **Power Pages Portal (Client Portal)** – Allows clients to **request events**, view **training materials**, access **reports**, and manage **entitlements**.
2. **Model-Driven App (Management App)** – Provides the management team with tools to oversee **staffing**, **kit management**, **communications**, **HR**, and **billing**.
3. **Canvas App (Brand Agents App)** – Allows brand agents to view assignments, **clock in/out**, **check in/out**, access training, and **communicate** with management.

#### **2.2 Core Entity Breakdown**

##### **2.2.1 Client and Brand Management**

1. **Client**

   - **Purpose**: Stores client information, including their brands and entitlements.
   - **Relationships**:
     - **One-to-Many with Activities**: Each client can schedule multiple activities (e.g., events, merchandising).
     - **One-to-Many with Brands**: Clients may represent multiple brands.
     - **One-to-Many with Entitlements**: Tracks client’s prepaid service units and usage.

2. **Brand**

   - **Purpose**: Represents a brand managed by a client, specifying kit and training needs.
   - **Relationships**:
     - **Many-to-One with Client**: Each brand belongs to a specific client.
     - **One-to-Many with Kit Templates**: Each brand specifies the kits required for its activities.

3. **Entitlement**

   - **Purpose**: Tracks the client’s pre-purchased service units that are consumed for event and activity assignments.
   - **Relationships**:
     - **One-to-Many with Activities**: Activities consume entitlement units.
     - **One-to-Many with Billing**: Billing records adjust entitlement usage for monthly reports.

##### **2.2.2 Activity Management**

1. **Activity** (Unified Assignable Task)

   - **Purpose**: Represents all assignable work, including events, merchandising, logistics, internal kit movements, and secret shopping.
   - **Types**: Events, merchandising, logistics, internal kit movements, and secret shopping.
   - **Relationships**:
     - **Many-to-One with Client**: Each activity is initiated by or relevant to a client.
     - **Many-to-One with Location**: Activities occur at specific locations within a client’s operational scope.
     - **One-to-Many with Assignments**: Tracks agents or staff members assigned to each activity.
     - **One-to-Many with Kits**: Relevant kits or materials required for each activity are logged here.

2. **Assignment**

   - **Purpose**: Tracks brand agents or team members assigned to each activity, ensuring all logistics and client activities are adequately staffed.
   - **Relationships**:
     - **Many-to-One with Activity**: Assignments are linked to a specific activity.
     - **One-to-Many with AttendanceLog**: Tracks clock-in and clock-out.
     - **One-to-Many with EventCheck**: Logs check-in and check-out for physical presence at activities.

##### **2.2.3 Kit and Inventory Management**

1. **Kit Template**

   - **Purpose**: Defines the standard contents of a kit based on the brand and activity type.
   - **Relationships**:
     - **Many-to-One with Brand**: Each template is associated with a brand.
     - **One-to-Many with Kit Instances**: Each template can have multiple physical kits.

2. **Kit Instance**

   - **Purpose**: Represents the physical kits, uniquely identified and tracked for usage.
   - **Relationships**:
     - **Many-to-One with Kit Template**: Each kit follows a defined template.
     - **One-to-Many with Kit Components**: Tracks items within the kit.
     - **Many-to-One with Activity**: Kits are assigned to activities as needed.

3. **Kit Component**

   - **Purpose**: Individual items within a kit instance, tracked for inventory and replenishment.
   - **Relationships**:
     - **Many-to-One with Kit Instance**: Components belong to a specific kit.

##### **2.2.4 Training and Certification Management**

1. **Course, Quiz, Certification**
   - **Purpose**: Manages training and certification of brand agents to ensure they meet client-specific needs.
   - **Relationships**:
     - **One-to-Many with Brand Agent**: Tracks completion status and eligibility.

##### **2.2.5 Attendance and Engagement Tracking**

1. **AttendanceLog**

   - **Purpose**: Logs clock-in and clock-out times for brand agents during assigned activities.
   - **Relationships**:
     - **Many-to-One with Assignment**: Tracks attendance for each assigned activity.

2. **EventCheck**

   - **Purpose**: Captures check-in and check-out times for physical presence validation.
   - **Relationships**:
     - **Many-to-One with Assignment**: Logs arrival and departure for each event or activity.

### **3. Business Process Workflows**

#### **3.1 Unified Activity Scheduling and Staffing**

1. **Client Requests Activity**

   - Clients request activities (e.g., event, merchandising) through the Power Pages portal.
   - The activity is logged in the system and linked to the relevant client and location.

2. **Agent Assignment**

   - Management assigns agents based on **certification**, **location**, and **availability**.
   - The assignment is tracked with clock-in/out requirements for time logging.

3. **Entitlement Usage and Billing**

   - Activities consume **entitlement hours** based on the duration and number of agents involved.
   - Billing is automatically adjusted to reflect usage, overages, and any roll-over credits.

#### **3.2 Kit Tracking and Inventory Management**

1. **Kit Assignment to Activities**

   - Kits are assigned to activities based on the **Kit Template** requirements.
   - After the activity, agents report on the **Kit Component** condition, updating inventory levels.

2. **Kit Replenishment**

   - Any missing or damaged items trigger replenishment actions to maintain kit completeness for future activities.

#### **3.3 Attendance Tracking for Activities**

1. **Clock-In and Clock-Out**

   - Brand agents clock in and out for each assigned activity, logging time spent via **AttendanceLog**.

2. **Check-In at Location**

   - Agents check in at activity locations to confirm physical presence, logged via **EventCheck**.

### **4. User Journeys and User Stories**

#### **4.1 Power Pages Portal (Client Portal)**

**User Stories**

1. _As a client, I want to securely log in and view a summary of my active events, training materials, and billing._

   - **Entities Engaged**: `Client`, `Activity`, `Entitlement`.

2. _As a client, I want to request an activity (e.g., merchandising, event) at a specific location._

   - **Entities Engaged**: `Client`, `Activity`, `Location`, `Assignment`.

3. _As a client, I want to see entitlement usage for all activities to manage my resources effectively._

   - **Entities Engaged**: `Entitlement`, `BillingRecord`, `Activity`.

4. _As a client, I want to manage access to the scheduling portal for my organization, so I can control who can request activities._

   - **Entities Engaged**: `ClientUser`, `AccessControl`.

5. _As a client, I want to see the status of all my kits, where they are scheduled, and where they were last used._

   - **Entities Engaged**: `KitInstance`, `Activity`, `Location`.

6. _As a client, I want a document repository where I can manage brand/product/demo information for training purposes._

   - **Entities Engaged**: `DocumentRepository`, `Brand`, `TrainingMaterial`.

7. _As a client, I want to be able to message the management team within the portal to address any questions or issues._

   - **Entities Engaged**: `Message`, `Client`, `ManagementTeam`.

8. _As a client, I want access to all the raw data from forms as well as PDF executive summaries from those events._

   - **Entities Engaged**: `DataForm`, `PDFSummary`, `Activity`.

9. _As a client, I want to securely log in and view a summary of my active events, training materials, and billing._

   - **Entities Engaged**: `Client`, `Activity`, `Entitlement`.

10. _As a client, I want to request an activity (e.g., merchandising, event) at a specific location._

    - **Entities Engaged**: `Client`, `Activity`, `Location`, `Assignment`.

11. _As a client, I want to see entitlement usage for all activities to manage my resources effectively._

    - **Entities Engaged**: `Entitlement`, `BillingRecord`, `Activity`.

12. _As a client, I want to manage access to the scheduling portal for my organization, so I can control who can request activities._

    - **Entities Engaged**: `ClientUser`, `AccessControl`.

13. _As a client, I want to see the status of all my kits, where they are scheduled, and where they were last used._

    - **Entities Engaged**: `KitInstance`, `Activity`, `Location`.

14. _As a client, I want a document repository where I can manage brand/product/demo information for training purposes._

    - **Entities Engaged**: `DocumentRepository`, `Brand`, `TrainingMaterial`.

15. _As a client, I want to be able to message the management team within the portal to address any questions or issues._

    - **Entities Engaged**: `Message`, `Client`, `ManagementTeam`.

16. _As a client, I want to securely log in and view a summary of my active events, training materials, and billing._

    - **Entities Engaged**: `Client`, `Activity`, `Entitlement`.

17. _As a client, I want to request an activity (e.g., merchandising, event) at a specific location._

    - **Entities Engaged**: `Client`, `Activity`, `Location`, `Assignment`.

18. _As a client, I want to see entitlement usage for all activities to manage my resources effectively._

    - **Entities Engaged**: `Entitlement`, `BillingRecord`, `Activity`.

#### **4.2 Model-Driven App (Management App)**

**User Stories**

1. _As a manager, I want a dashboard that shows events, merchandising, and logistics operations to monitor ongoing activities._

   - **Entities Engaged**: `Activity`, `Kit`, `Assignment`.

2. _As a manager, I want to assign agents to activities, ensuring they are qualified and available._

   - **Entities Engaged**: `Assignment`, `Activity`, `BrandAgent`.

3. _As a manager, I want to monitor kit usage and replenishment needs to maintain inventory._

   - **Entities Engaged**: `KitInstance`, `KitComponent`.

4. _As a manager, I want to use attendance logs to verify agents’ hours worked and adjust client billing accordingly._

   - **Entities Engaged**: `AttendanceLog`, `Entitlement`, `BillingRecord`.

5. _As a manager, I want a dashboard to plan staffing and kit coordination/logistics for upcoming events._

   - **Entities Engaged**: `Activity`, `Assignment`, `KitInstance`.

6. _As a manager, I want to communicate with brand agents in the field using Twilio for real-time updates and assistance._

   - **Entities Engaged**: `Message`, `BrandAgent`, `Activity`.

7. _As a manager, I want to look up event form data for any event to review the details and performance._

   - **Entities Engaged**: `DataForm`, `Activity`.

8. _As a manager, I want to book, update, or change events on behalf of clients to meet dynamic client needs._

   - **Entities Engaged**: `Activity`, `Client`, `Location`.

9. _As a manager, I want a dashboard that shows events, merchandising, and logistics operations to monitor ongoing activities._

   - **Entities Engaged**: `Activity`, `Kit`, `Assignment`.

10. _As a manager, I want to assign agents to activities, ensuring they are qualified and available._

    - **Entities Engaged**: `Assignment`, `Activity`, `BrandAgent`.

11. _As a manager, I want to monitor kit usage and replenishment needs to maintain inventory._

    - **Entities Engaged**: `KitInstance`, `KitComponent`.

12. _As a manager, I want to use attendance logs to verify agents’ hours worked and adjust client billing accordingly._

    - **Entities Engaged**: `AttendanceLog`, `Entitlement`, `BillingRecord`.

#### **4.3 Canvas App (Brand Agents App)**

**User Stories**

1. _As a brand agent, I want to clock in and clock out for each activity to ensure my working hours are accurately tracked._

   - **Entities Engaged**: `AttendanceLog`, `Assignment`.

2. _As a brand agent, I want to check in at the activity location to confirm my presence._

   - **Entities Engaged**: `EventCheck`, `Assignment`.

3. _As a brand agent, I want to receive SMS updates about activities, so I’m aware of any changes or requirements._

   - **Entities Engaged**: `Message`, `Activity`.

4. _As a brand agent, I want to submit an expense report to get reimbursed for expenses incurred during my assignments._

   - **Entities Engaged**: `ExpenseReport`, `Assignment`.

5. _As a brand agent, I want to see my schedule for upcoming assignments so that I can plan my availability._

   - **Entities Engaged**: `Assignment`, `Activity`.

6. _As a brand agent, I want to set my availability so that management knows when I am available for assignments._

   - **Entities Engaged**: `Availability`, `BrandAgent`.

7. _As a brand agent, I want to request to work a shift/event/assignment to indicate my interest in available opportunities._

   - **Entities Engaged**: `AssignmentRequest`, `Activity`, `BrandAgent`.

8. \*As a brand agent, I want to submit a data form (using JotForm) to provide required information for my assignments, with the data syncin**\*Entities Engaged**: `DataForm`, `Assignment`, `Activity`.1. _As a brand agent, I want to clock in and clock out for each activity to en\*\*g to Dataverse upon submission._

   - _sure my working hours are accurately tracked._

   * **Entities Engaged**: `AttendanceLog`, `Assignment`.

9. _As a brand agent, I want to check in at the activity location to confirm my presence._

   - **Entities Engaged**: `EventCheck`, `Assignment`.

10. _As a brand agent, I want to receive SMS updates about activities, so I’m aware of any changes or requirements._

    - **Entities Engaged**: `Message`, `Activity`.
