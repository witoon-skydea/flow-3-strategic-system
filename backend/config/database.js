const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure db directory exists
const dbDir = path.join(__dirname, '../db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'flow3.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    name TEXT,
    role TEXT CHECK(role IN ('admin', 'management', 'staff')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, initDefaultUser);

  // Create Organizations table
  db.run(`CREATE TABLE IF NOT EXISTS organizations (
    org_id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_name TEXT NOT NULL,
    vision TEXT,
    mission TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create Strategy Plans table
  db.run(`CREATE TABLE IF NOT EXISTS strategy_plans (
    strategy_plan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER,
    plan_name TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(org_id)
  )`);

  // Create Strategic Goals table
  db.run(`CREATE TABLE IF NOT EXISTS strategic_goals (
    goal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy_plan_id INTEGER,
    goal_description TEXT NOT NULL,
    target_metric TEXT,
    target_value TEXT,
    deadline TEXT,
    actual_value TEXT,
    progress INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (strategy_plan_id) REFERENCES strategy_plans(strategy_plan_id)
  )`);

  // Create HR Development Plans table
  db.run(`CREATE TABLE IF NOT EXISTS hr_dev_plans (
    hr_plan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy_plan_id INTEGER,
    plan_name TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (strategy_plan_id) REFERENCES strategy_plans(strategy_plan_id)
  )`);

  // Create HR Development Initiatives table
  db.run(`CREATE TABLE IF NOT EXISTS hr_dev_initiatives (
    hr_initiative_id INTEGER PRIMARY KEY AUTOINCREMENT,
    hr_plan_id INTEGER,
    initiative_name TEXT NOT NULL,
    description TEXT,
    required_competencies TEXT,
    training_resources TEXT,
    budget REAL,
    responsible_person_id INTEGER,
    status TEXT,
    progress INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hr_plan_id) REFERENCES hr_dev_plans(hr_plan_id),
    FOREIGN KEY (responsible_person_id) REFERENCES users(id)
  )`);

  // Create Digital Development Plans table
  db.run(`CREATE TABLE IF NOT EXISTS digital_dev_plans (
    digital_plan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy_plan_id INTEGER,
    plan_name TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (strategy_plan_id) REFERENCES strategy_plans(strategy_plan_id)
  )`);

  // Create Digital Initiatives table
  db.run(`CREATE TABLE IF NOT EXISTS digital_initiatives (
    digital_initiative_id INTEGER PRIMARY KEY AUTOINCREMENT,
    digital_plan_id INTEGER,
    initiative_name TEXT NOT NULL,
    description TEXT,
    technology_stack TEXT,
    required_infrastructure TEXT,
    budget REAL,
    responsible_person_id INTEGER,
    status TEXT,
    progress INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (digital_plan_id) REFERENCES digital_dev_plans(digital_plan_id),
    FOREIGN KEY (responsible_person_id) REFERENCES users(id)
  )`);

  // Create Action Plans table
  db.run(`CREATE TABLE IF NOT EXISTS action_plans (
    action_plan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy_plan_id INTEGER,
    year INTEGER,
    plan_name TEXT NOT NULL,
    description TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (strategy_plan_id) REFERENCES strategy_plans(strategy_plan_id)
  )`);

  // Create Departments table
  db.run(`CREATE TABLE IF NOT EXISTS departments (
    department_id INTEGER PRIMARY KEY AUTOINCREMENT,
    department_name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create Action Items table
  db.run(`CREATE TABLE IF NOT EXISTS action_items (
    action_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_plan_id INTEGER,
    goal_id INTEGER,
    item_description TEXT NOT NULL,
    responsible_department_id INTEGER,
    responsible_person_id INTEGER,
    start_date TEXT,
    due_date TEXT,
    kpi TEXT,
    kpi_target TEXT,
    kpi_actual TEXT,
    budget REAL,
    status TEXT,
    progress INTEGER DEFAULT 0,
    progress_update TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (action_plan_id) REFERENCES action_plans(action_plan_id),
    FOREIGN KEY (goal_id) REFERENCES strategic_goals(goal_id),
    FOREIGN KEY (responsible_department_id) REFERENCES departments(department_id),
    FOREIGN KEY (responsible_person_id) REFERENCES users(id)
  )`);

  // Create Risk Management Plans table
  db.run(`CREATE TABLE IF NOT EXISTS risk_management_plans (
    risk_plan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_name TEXT NOT NULL,
    description TEXT,
    year INTEGER,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create Risks table
  db.run(`CREATE TABLE IF NOT EXISTS risks (
    risk_id INTEGER PRIMARY KEY AUTOINCREMENT,
    risk_plan_id INTEGER,
    strategy_plan_id INTEGER,
    action_item_id INTEGER,
    risk_description TEXT NOT NULL,
    likelihood TEXT,
    impact TEXT,
    risk_score INTEGER,
    mitigation_strategy TEXT,
    contingency_plan TEXT,
    responsible_person_id INTEGER,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (risk_plan_id) REFERENCES risk_management_plans(risk_plan_id),
    FOREIGN KEY (strategy_plan_id) REFERENCES strategy_plans(strategy_plan_id),
    FOREIGN KEY (action_item_id) REFERENCES action_items(action_item_id),
    FOREIGN KEY (responsible_person_id) REFERENCES users(id)
  )`);
}

// Initialize default admin user
function initDefaultUser() {
  const bcrypt = require('bcryptjs');
  
  // Check if admin user exists
  db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, user) => {
    if (err) {
      console.error('Error checking for admin user:', err.message);
      return;
    }
    
    // If admin doesn't exist, create it
    if (!user) {
      // Hash password
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          console.error('Error generating salt:', err.message);
          return;
        }
        
        bcrypt.hash('123456', salt, (err, hash) => {
          if (err) {
            console.error('Error hashing password:', err.message);
            return;
          }
          
          // Insert admin user
          db.run(
            'INSERT INTO users (username, password, email, name, role) VALUES (?, ?, ?, ?, ?)',
            ['admin', hash, 'admin@flow3.com', 'Administrator', 'admin'],
            function(err) {
              if (err) {
                console.error('Error creating admin user:', err.message);
              } else {
                console.log('Default admin user created');
              }
            }
          );
        });
      });
    }
  });
}

// Export database connection
module.exports = db;
