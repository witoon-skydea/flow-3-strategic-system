# Flow-3: Strategic Management System

A comprehensive strategic management system that helps organizations manage their strategic plans, HR and digital development plans, action plans, and risk management.

## Main Features

1. **Strategy Plan Management**: Define and track organizational strategy plans and goals
2. **HR Development Plan**: Manage HR development initiatives linked to strategy
3. **Digital Development Plan**: Manage digital transformation initiatives linked to strategy
4. **Action Plan**: Implement annual operational plans integrating HR and Digital plans
5. **Risk Management**: Identify and track risks associated with strategy and action plans

## Dashboard

The system includes a comprehensive dashboard for monitoring:
- Strategic KPI tracking
- Project progress
- Risk assessment
- HR and Digital transformation progress

## Technical Stack

- **Backend**: Node.js with Express
- **Frontend**: React
- **Database**: SQLite
- **Authentication**: JWT

## Installation

1. Clone the repository
```
git clone https://github.com/yourusername/flow-3.git
cd flow-3
```

2. Install dependencies
```
npm install
```

3. Run the server
```
npm run server
```

## API Documentation

The API supports the following endpoints:

- **Authentication**:
  - `POST /api/auth/login`: Login and get JWT token
  - `GET /api/auth/me`: Get current user

- **Users**:
  - `GET /api/users`: Get all users
  - `GET /api/users/:id`: Get user by ID
  - `POST /api/users`: Create a new user
  - `PUT /api/users/:id`: Update a user
  - `DELETE /api/users/:id`: Delete a user

- **Organizations**:
  - `GET /api/organizations`: Get all organizations
  - `GET /api/organizations/:id`: Get organization by ID
  - `POST /api/organizations`: Create a new organization
  - `PUT /api/organizations/:id`: Update an organization
  - `DELETE /api/organizations/:id`: Delete an organization

- **Strategy Plans**:
  - `GET /api/strategy-plans`: Get all strategy plans
  - `GET /api/strategy-plans/:id`: Get strategy plan by ID
  - `POST /api/strategy-plans`: Create a new strategy plan
  - `PUT /api/strategy-plans/:id`: Update a strategy plan
  - `DELETE /api/strategy-plans/:id`: Delete a strategy plan

- **Strategic Goals**:
  - `GET /api/strategic-goals`: Get all strategic goals
  - `GET /api/strategic-goals/:id`: Get strategic goal by ID
  - `POST /api/strategic-goals`: Create a new strategic goal
  - `PUT /api/strategic-goals/:id`: Update a strategic goal
  - `DELETE /api/strategic-goals/:id`: Delete a strategic goal

- **HR Development Plans and Initiatives**:
  - `GET /api/hr-dev-plans`: Get all HR development plans
  - `GET /api/hr-dev-initiatives`: Get all HR development initiatives

- **Digital Development Plans and Initiatives**:
  - `GET /api/digital-dev-plans`: Get all digital development plans
  - `GET /api/digital-initiatives`: Get all digital initiatives

- **Action Plans and Items**:
  - `GET /api/action-plans`: Get all action plans
  - `GET /api/action-items`: Get all action items

- **Risk Management**:
  - `GET /api/risk-management-plans`: Get all risk management plans
  - `GET /api/risks`: Get all risks

- **Dashboard**:
  - `GET /api/dashboard/overview`: Get overview dashboard data
  - `GET /api/dashboard/strategic-kpi`: Get strategic KPI data
  - `GET /api/dashboard/action-kpi`: Get action item KPI data
  - `GET /api/dashboard/risk-summary`: Get risk summary data
  - `GET /api/dashboard/timeline`: Get timeline data

## User Roles

- **Admin**: Full access to all features, including user management
- **Management**: Can create and update strategy plans, but cannot manage users
- **Staff**: Can view data and update progress

## Default Credentials

- **Username**: admin
- **Password**: 123456

## Reverse Proxy Compatibility

This application is designed to work correctly when deployed via a Reverse Proxy using a sub-path. The base path is configurable via the `BASE_PATH` environment variable.
