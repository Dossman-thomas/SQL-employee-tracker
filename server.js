// Import dependencies
const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const table = require('table');

// Set PORT
const PORT = process.env.PORT || 3001;

// Initialize instance of express.js
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // Add MySQL password
    password: 'Orca92',
    database: 'company_db'
  },
  console.log(`Connected to the company database.`)
);

// view all departments
db.query(
  'SELECT * FROM departments',
   function (err, results) {
    console.log('Here are all company departments');
    console.table(results);
  }
);

// view all roles
db.query(
  `SELECT r.role_id, r.job_title, d.department_name, r.role_salary FROM roles r
  JOIN departments d ON r.department_id = d.department_id;`, 
  function (err, results) {
    console.log('Here are all department roles');
    console.table(results);
  }
);

// view all employees
db.query(
  `SELECT e.employee_id, e.employee_first_name, e.employee_last_name, r.job_title, d.department_name, r.role_salary, CONCAT(m.employee_first_name, ' ', m.employee_last_name) AS manager_name
  FROM employees e
  JOIN roles r ON e.role_id = r.role_id
  JOIN departments d ON r.department_id = d.department_id
  LEFT JOIN employees m ON e.manager_id = m.employee_id
  ;`,
  function (err, results) {
    console.log('Here are all employees');
    console.table(results);
  }
);

