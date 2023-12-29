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
        // add department function
        addDepartment();
        break;

      case "View All Roles":
        // view roles function
        viewAllRoles();
        break;   

      case "Add Role":
        // Add role function
        addRole();
        break;

      case "View All Employees":
        // view employees function
        viewAllEmployees();
        break;

      case "Add Employee":
        // add employee function
        addEmployee();
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

// Add a department - prompted to enter the name of the department and that department is added to the database
const addDepartment = () => {

  inquirer
  .prompt([
    {
      type: "input",
      name: "department_name",
      message: "Enter the name of the new department."
    }
  ])
  .then((answers) => {

    const depName = [ answers.department_name ];
    db.query(
  `INSERT INTO departments (department_name) 
  VALUES (?)`, depName, function (err, results) {

    if (err) throw err;
      console.log(`Added ${answers.department_name} to the departments table!`);

      // display updated department table
      viewAllDepartments();
      } 
    );
  })

};

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

// add a role - prompted to enter the name, salary, and department for the role and that role is added to the database
const addRole = () => {

  db.query("SELECT * FROM departments", (err, res) => {

    if (err) throw err;

    inquirer
    .prompt([
      {
        type: "input",
        name: "role_name",
        message: "Enter the name of the new role."
      },
      {
        type: "input",
        name: "role_salary",
        message: "Enter the salary of the role."
      },
      {
        type: "list",
        name: "department_name",
        message: "Select the name of the new role's department.",
        choices: res.map (
          (department) => department.department_name
        )
      },
    ])
    .then((answers) => {

      const department = res.find(
        (departments) => departments.department_name === answers.department_name
      );

      // console.log (department.department_id);

      const newRole = [ 
        answers.role_name, 
        answers.role_salary, 
        department.department_id
      ];

      db.query(
    `INSERT INTO roles (job_title, role_salary, department_id) 
    VALUES (?)`, [newRole], function (err, results) {

      if (err) throw err;
        console.log(`Added ${answers.role_name} to the roles table!`);

        // display updated roles table
        viewAllRoles();
        } 
      );
    })
  });
}; 


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

// add employee - prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
const addEmployee = () => {
  db.query("SELECT role_id, job_title FROM roles", (err, rolesResult) => {
    if (err) throw err;

    db.query("SELECT employee_id, CONCAT(employee_first_name, ' ', employee_last_name) AS manager_name FROM employees", (err, managersResult) => {
      if (err) throw err;

      inquirer
        .prompt([
          {
            type: "input",
            name: "first_name",
            message: "Enter the new employee's first name."
          },
          {
            type: "input",
            name: "last_name",
            message: "Enter the new employee's last name."
          },
          {
            type: "list",
            name: "job_title",
            message: "Select the new employee's job title.",
            choices: rolesResult.map((jobTitles) => jobTitles.job_title)
          },
          {
            type: "list",
            name: "manager_name",
            message: "Select the new employee's manager.",
            choices: [
              { name: "None", value: null },
              ...managersResult.map((manager) => ({ name: manager.manager_name, value: manager.employee_id })),
            ]
          },
        ])
        .then((answers) => {
          const selectedRole = rolesResult.find(
            (role) => role.job_title === answers.job_title
          );

          const selectedManager = managersResult.find(
            (manager) => manager.employee_id === answers.manager_name
          );

          const newEmployee = [
            answers.first_name,
            answers.last_name,
            selectedRole.role_id,
            selectedManager ? selectedManager.employee_id : null,
          ];

          db.query(
            `INSERT INTO employees (employee_first_name, employee_last_name, role_id, manager_id) VALUES (?)`,
            [newEmployee],
            function (err, results) {
              if (err) throw err;
              console.log(`Added ${answers.first_name} ${answers.last_name} to the employees table!`);

              // Display updated employees table
              viewAllEmployees();
            }
          );
        });
    });
  });
};




// update an employee role - prompted to select an employee to update and their new role and this information is updated in the database
