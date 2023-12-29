// Import dependencies
const mysql = require('mysql2');
const inquirer = require('inquirer');
const table = require('table');


// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'Orca92',
    database: 'company_db'
  },
);

// Ensure the connection is established before calling init
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to the company database.');
    init();
  }
});

const init = () => {
  inquirer
  .prompt([
    {
      type: "list",
      name: "start",
      message: "What would you like to do?",
      choices: [
        "View All Departments",
        "Add Department",
        "View All Roles",
        "Add Role",
        "View All Employees",
        "Add Employee",
        "Update Employee Role",
        "Exit"
      ]
    }
  ])
  .then((answers) => {
    switch (answers.start){

      case "View All Departments":
        // view departments function
        viewAllDepartments();
        break;

      case "Add Department":
        console.log('add department');
        // add department function
        break;

      case "View All Roles":
        // view roles function
        viewAllRoles();
        break;   

      case "Add Role":
        console.log('add role');
        // Add role function
        break;

      case "View All Employees":
        console.log('view employees');
        // view employees function
        viewAllEmployees();
        break;

      case "Add Employee":
        console.log('add employee');
        // add employee function
        break;
      
      case "Update Employee Role":
        console.log('update role');
        // update role function
        break;

      case "Exit":
        // end connection
        db.end();
        console.log("Bye!");
        break;
    }
   
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });
}

// UTILITY FUNCTIONS

// view all departments
const viewAllDepartments = () => {

  db.query(
    'SELECT * FROM departments',
     function (err, results) {
      console.log('Here are all company departments');
      console.table(results);
    }
  );

  // restart app
  init();
};

// Add a department


// view all roles
const viewAllRoles = () => {

  db.query(
    `SELECT r.role_id, r.job_title, d.department_name, r.role_salary FROM roles r
    JOIN departments d ON r.department_id = d.department_id;`, 
    function (err, results) {
      console.log('Here are all department roles');
      console.table(results);
    }
  );

  // restart app
  init();
};

// add a role


// view all employees
const viewAllEmployees = () => {

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

    // restart app
    init();
};

// add a department - prompted to enter the name of the department and that department is added to the database
// db.query(
//   `INSERT INTO departments (department_name) 
//   VALUES 
//   ();`
// );

// add a role - prompted to enter the name, salary, and department for the role and that role is added to the database


// add an employee - prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database


// update an employee role - prompted to select an employee to update and their new role and this information is updated in the database
