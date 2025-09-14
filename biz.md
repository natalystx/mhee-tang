# App Concept Summary: Automated Financial Wellness (Updated)

This document provides a complete overview of the financial tracking application, from its high-level business strategy to its detailed feature set and user flows, incorporating the latest four-tier subscription model.

---

## 1. Business Model & Feature Tiers

### Business Model: Freemium

The app operates on a **Freemium** model designed for the Thai market. The goal is to attract a wide user base with a functional free tier and provide a clear, compelling upgrade path through four distinct tiers as users' financial needs mature.

- **Free Tier:** An entry point for basic expense tracking, offering a limited taste of the app's core automation.
- **Premium Tier:** The core paid offering, providing a complete, automated, real-time view of a user's entire financial health _right now_.
- **Planner Tier:** A mid-tier plan for users ready to actively plan their financial future with powerful forecasting and debt-planning tools, without AI-driven features.
- **Planner Plus Tier:** The high-end tier for power users, focused on optimizing their future with unlimited forecasting and AI-powered guidance.

### Feature Tiers & Pricing Summary

| Feature                             | Free               | Premium (The Hub)                     | **Planner (The Forecaster)**             | Planner Plus (The Advisor)               |
| ----------------------------------- | ------------------ | ------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| Manual & Automated Expense Tracking | ✓                  | ✓                                     | ✓                                        | ✓                                        |
| E-Slip & Receipt Scanning           | Limited (20/month) | Unlimited                             | Unlimited                                | Unlimited                                |
| Budget Creation ("Wallets")         | Limited (2)        | Unlimited                             | Unlimited                                | Unlimited                                |
| Data Export (CSV)                   |                    | ✓                                     | ✓                                        | ✓                                        |
| Standard Reporting & Analytics      |                    | ✓                                     | ✓                                        | ✓                                        |
| **Integrated Debt Payoff Planner**  |                    |                                       | ✓                                        | ✓                                        |
| **Scenario/Future Planning**        |                    |                                       | **Limited (3 Scenarios)**                | **Unlimited**                            |
| AI-Powered Insights & Coaching      |                    |                                       |                                          | ✓                                        |
| Priority Support                    |                    |                                       |                                          | ✓                                        |
| **Price**                           | **Free**           | **99 THB/month** <br> or 799 THB/year | **149 THB/month** <br> or 1,199 THB/year | **199 THB/month** <br> or 1,499 THB/year |

---

## 2. Target User Personas

### Persona 1: Ploy (The Everyday Tracker)

A 28-year-old professional in Bangkok who is tech-savvy but lacks clarity on her monthly spending. Her goal is to **gain visibility and control** over her daily expenses. She is the target user for the **Free** and **Premium** tiers.

### Persona 2: Anan (The Family Planner)

A 38-year-old professional with a family, mortgage, and investments. He needs more than just tracking; he wants to **optimize his finances, pay off debt efficiently, and plan for future goals**. He is the ideal user for the **Planner** or **Planner Plus** tiers.

---

## 3. Core User Flows

### A. User Onboarding Flow

The onboarding is designed to deliver the **"Aha!" Moment** within 60 seconds by guiding the user to successfully scan their first e-slip, demonstrating the app's core value immediately.

### B. Income Management Flow

Users can perform **manual entry** for one-off income or set up **recurring income** (e.g., salary) to be logged automatically. Income is clearly differentiated from expenses and visualized in a simple **Income vs. Expense** dashboard chart.

### C. The "Wallet" Budgeting Flow

This intuitive system allows users to create budgets ("Wallets") for specific categories. When a user logs a categorized expense, the amount is **automatically deducted** from the corresponding wallet, with visual progress bars and proactive alerts providing feedback.

---

## 4. Comprehensive Feature List

_(Note: Feature availability is dependent on the user's subscription tier)_

### I. Core Transaction Management

- **Comprehensive Transaction Logging:** Add, edit, and delete income/expenses.
- **Persistent Transaction History:** All transactions are saved permanently and are fully searchable.
- **Recurring Transactions:** Schedule automatic logging for recurring income and expenses.
- **Transaction Tagging:** Assign multiple custom tags for flexible reporting.

### II. Automation & Intelligence

- **Receipt & E-Slip Scanning (OCR):** Automatically extract transaction details from Thai e-slips and receipts.
- **Automatic Transaction Categorization:** Intelligently suggest categories for new transactions.

### III. Budgeting & Financial Planning

- **Envelope Budgeting System ("Wallets"):** Create virtual budgets for specific spending categories.
- **Flexible Budgeting Periods:** Set budgets for daily, weekly, monthly, or custom cycles.
- **Financial Scenario Planning:** Model the future financial impact of major life events or goals.

### IV. Account Management

- **Credit Card Management:** Track balances and set payment due dates.
- **Payment Reminders & Alerts:** Receive push notifications for upcoming bill due dates.
- **Debt Payoff Planner:** List all debts, track progress, and compare payoff strategies.
- **Custom Reporting Cycles:** Align the monthly summary with a user's salary or statement cycle.

### V. Dashboard & Reporting

- **Central Dashboard:** An at-a-glance overview of financial health with customizable widgets.
- **Key Widgets:** Include Current Balances, Spend Summaries, Recent Transactions, Spending by Category charts, and Budget Status.
- **Trend Comparison Graph:** Visually compare spending from one period to the next.
- **Secure Data Export (CSV):** Export transaction history via a secure, time-limited download link.

```mermaid
erDiagram
    %% Core User and Account Entities
    User {
        int user_id PK
        string email
        string password_hash
        string subscription_tier
        datetime created_at
    }

    Card {
        int card_id PK
        int user_id FK
        string card_name
        string bank_name
        decimal credit_limit "Optional"
        decimal current_balance
        int statement_day
        int due_days_after_statement
    }

    %% Main Transactional Entities
    Transaction {
        int transaction_id PK
        int user_id FK
        int card_id FK "Optional, if paid by card"
        int category_id FK
        decimal amount
        string type "expense or income"
        string merchant_or_source
        date transaction_date
        string notes
    }

    Category {
        int category_id PK
        int user_id FK "Null for default categories"
        string name
        string icon
        string type "expense or income"
    }

    Tag {
        int tag_id PK
        int user_id FK
        string name
    }

    TransactionTag {
        int transaction_id FK
        int tag_id FK
    }

    RecurringTransaction {
        int recurring_id PK
        int user_id FK
        int category_id FK
        decimal amount
        string type "expense or income"
        string frequency "monthly, weekly"
        date start_date
        date end_date "For installments"
    }

    %% Budgeting and Planning Entities
    Budget {
        int budget_id PK
        int user_id FK
        int category_id FK
        string name
        decimal amount_limit
        string period "monthly, weekly, custom"
        int reset_day "For monthly budgets"
    }

    Goal {
        int goal_id PK
        int user_id FK
        string name
        string icon
        decimal target_amount
        decimal current_amount
        date target_date "Optional"
    }

    Scenario {
        int scenario_id PK
        int user_id FK
        string name
        datetime created_at
    }

    ScenarioEvent {
        int event_id PK
        int scenario_id FK
        string event_type "income_change, etc."
        json details
    }

    %% AI and System Entities
    AI_Insight {
        int insight_id PK
        int user_id FK
        string title
        string body_text
        bool is_read
        datetime created_at
    }

    %% Defining Relationships
    User ||--o{ Card : "manages"
    User ||--o{ Transaction : "performs"
    User ||--o{ Category : "creates"
    User ||--o{ Tag : "creates"
    User ||--o{ Budget : "sets"
    User ||--o{ Goal : "sets"
    User ||--o{ Scenario : "creates"
    User ||--o{ AI_Insight : "receives"
    User ||--o{ RecurringTransaction : "schedules"

    Card ||--o{ Transaction : "used for"
    Category ||--o{ Transaction : "classifies"
    Category ||--o{ Budget : "is for"

    Transaction }|--|{ Tag : "has"
    Transaction ||--o{ TransactionTag : "linked via"
    Tag ||--o{ TransactionTag : "linked via"

    Scenario ||--o{ ScenarioEvent : "contains"
```
