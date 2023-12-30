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
        "Update Employee Manager",
        "View Employees by Manager",
        "View Employees by Department",
        "Delete Employee",
        "Delete Role",
        "Delete Department",
        "View Utilized Budget by Department",
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
        // update role function
        updateEmployeeRole();
        break;

      case "Update Employee Manager":
        // update role function
        updateEmployeeManager();
        break;
      
      case "View Employees by Manager":
        // view employee by manager function
        viewEmployeesByManager();
        break;

      case "View Employees by Department":
        // view employees by deparment function
        viewEmployeesByDepartment();
        break;
      
      case "Delete Employee":
        //delete employee function
        deleteEmployee();
        break;

      case "Delete Role":
        //delete role function
        deleteRole();
        break;

      case "Delete Department":
        // delete department function
        deleteDepartment();
        break;
      
      case "View Utilized Budget by Department":
        // view budget function
        viewBudgetByDepartment();
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
        console.log(`\nAdded ${answers.role_name} to the roles table!`);

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
    function (err, res) {
      console.log('\nHere are all employees');
      console.table(res);
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

const updateEmployeeRole = () => {

  db.query("SELECT * FROM employees", (err, employeesResult) => {
    if (err) throw err;

    db.query("SELECT role_id, job_title FROM roles", (err, rolesResult) => {
      if (err) throw err;

      inquirer
        .prompt([
          {
            type: "list",
            name: "employee_name",
            message: "Select the employee to update:",
            choices: employeesResult.map((employee) => ({
              name: `${employee.employee_first_name} ${employee.employee_last_name}`,
              value: employee.employee_id,
            })),
          },
          {
            type: "list",
            name: "new_role",
            message: "Select the employee's new role:",
            choices: rolesResult.map((role) => role.job_title),
          },
        ])
        .then((answers) => {
          const selectedEmployee = employeesResult.find(
            (employee) => employee.employee_id === answers.employee_name
          );

          const selectedRole = rolesResult.find(
            (role) => role.job_title === answers.new_role
          );

          db.query(
            `UPDATE employees SET role_id = ? WHERE employee_id = ?`,
            [ selectedRole.role_id, selectedEmployee.employee_id ],
            function (err, results) {
              if (err) throw err;
              console.log(
                `Updated role for ${selectedEmployee.employee_first_name} ${selectedEmployee.employee_last_name} to ${answers.new_role}!`
              );

              // Display updated employees table
              viewAllEmployees();
            }
          );
        });
    });
  });
};

// update employee managers
const updateEmployeeManager = () => {

  db.query("SELECT * FROM employees", (err, employeesResult) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "list",
          name: "employee_name",
          message: "Select the employee to update:",
          choices: employeesResult.map((employee) => ({
            name: `${employee.employee_first_name} ${employee.employee_last_name}`,
            value: employee.employee_id,
          })),
        },
        {
          type: "list",
          name: "new_manager",
          message: "Select the employee's new manager:",
          choices: employeesResult.map((employee) => ({
            name: `${employee.employee_first_name} ${employee.employee_last_name}`,
            value: employee.employee_id,
          })),
        },
      ])
      .then((answers) => {
        const selectedEmployee = employeesResult.find(
          (employee) => employee.employee_id === answers.employee_name
        );

        const selectedManager = employeesResult.find(
          (manager) => manager.employee_id === answers.new_manager
        );

        db.query(
          `UPDATE employees SET manager_id = ? WHERE employee_id = ?`,
          [ selectedManager.employee_id, selectedEmployee.employee_id ],
          function (err, results) {
            if (err) throw err;
            console.log(
              `Updated manager for ${selectedEmployee.employee_first_name} ${selectedEmployee.employee_last_name} to ${answers.new_manager}!`
            );

            // Display updated employees table
            viewAllEmployees();
          }
        );
      });
  });
};


// View employees by manager
const viewEmployeesByManager = () => {
  // Query the database to get a list of all managers
  db.query(`SELECT DISTINCT manager_id, 
  (SELECT CONCAT(employee_first_name, ' ', employee_last_name)
  FROM employees m WHERE m.employee_id = e.manager_id) AS manager_name
  FROM employees e
  WHERE e.manager_id IS NOT NULL`, (err, managersResult) => {
    if (err) throw err;

    // Prompt the user to select a manager
    inquirer
      .prompt([
        {
          type: "list",
          name: "selected_manager",
          message: "Select the manager to view employees:",
          choices: managersResult.map((manager) => ({
            name: manager.manager_name,
            value: manager.manager_id,
          })),
        },
      ])
      .then((answers) => {
        // Query the database to get employees based on the selected manager
        db.query(
          `SELECT e.employee_id, e.employee_first_name, e.employee_last_name, r.job_title, d.department_name, r.role_salary, CONCAT(m.employee_first_name, ' ', m.employee_last_name) AS manager_name
          FROM employees e
          JOIN roles r ON e.role_id = r.role_id
          JOIN departments d ON r.department_id = d.department_id
          LEFT JOIN employees m ON e.manager_id = m.employee_id
          WHERE e.manager_id = ?`,
          [ answers.selected_manager ],
          (err, employeesResult) => {
            if (err) throw err;
            // console.log(answers.selected_manager);
            // Display the list of employees under the selected manager
            console.log(`Employees under Manager ID ${answers.selected_manager}:`);
            console.table(employeesResult);

            // Restart the application
            init();
          }
        );
      });
  });
};


// View employees by department
const viewEmployeesByDepartment = () => {
  // Query the database to get a list of all departments
  db.query("SELECT DISTINCT department_id, department_name FROM departments", (err, departmentsResult) => {
    if (err) throw err;

    // Prompt the user to select a department
    inquirer
      .prompt([
        {
          type: "list",
          name: "selected_department",
          message: "Select the department to view employees:",
          choices: departmentsResult.map((department) => ({
            name: department.department_name,
            value: department.department_id,
          })),
        },
      ])
      .then((answers) => {
        // Query the database to get employees based on the selected department
        db.query(
          `SELECT e.employee_id, e.employee_first_name, e.employee_last_name, r.job_title, d.department_name, r.role_salary, CONCAT(m.employee_first_name, ' ', m.employee_last_name) AS manager_name
          FROM employees e
          JOIN roles r ON e.role_id = r.role_id
          JOIN departments d ON r.department_id = d.department_id
          LEFT JOIN employees m ON e.manager_id = m.employee_id
          WHERE d.department_id = ?`,
          [ answers.selected_department ],
          (err, employeesResult) => {
            if (err) throw err;

            // Display the list of employees in the selected department
            console.log(`Employees in Department ${answers.selected_department}:`);
            console.table(employeesResult);

            // Restart the application
            init();
          }
        );
      });
  });
};

// Delete employee
const deleteEmployee = () => {

  db.query("SELECT * FROM employees", (err, employeesResult) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "list",
          name: "employee_name",
          message: "Select the employee to delete:",
          choices: employeesResult.map((employee) => ({
            name: `${employee.employee_first_name} ${employee.employee_last_name}`,
            value: employee.employee_id,
          })),
        }
      ])
      .then((answers) => {
        const selectedEmployee = employeesResult.find(
          (employee) => employee.employee_id === answers.employee_name
        );

        db.query(
          `DELETE FROM employees WHERE employee_id = ?`,
          [ selectedEmployee.employee_id ],
          function (err, results) {
            if (err) throw err;
            console.log(
              `Deleted ${selectedEmployee.employee_first_name} ${selectedEmployee.employee_last_name} successfully.`
            );

            // Display updated employees table
            viewAllEmployees();
          }
        );
      });
  });
};


// delete role
const deleteRole = () => {
  // Query the database to get a list of all roles
  db.query("SELECT * FROM roles", (err, rolesResult) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "list",
          name: "role_id",
          message: "Select a role to delete:",
          choices: rolesResult.map((role) => ({
            name: role.job_title,
            value: role.role_id,
          })),
        },
      ])
      .then((answers) => {
        const selectedRole = rolesResult.find(
          (role) => role.role_id === answers.role_id
        );

        // Check if there are any employees in the selected role
        db.query(
          "SELECT * FROM employees WHERE role_id = ?",
          [selectedRole.role_id],
          (err, employeesResult) => {
            if (err) throw err;

            if (employeesResult.length > 0) {
              console.log(
                "Cannot delete the role. There are employees assigned to this role. Delete employees in this role to continue."
              );
              // restart app
              init();
            } else {
              // No employees in the role, proceed with deletion
              db.query(
                "DELETE FROM roles WHERE role_id = ?",
                [selectedRole.role_id],
                (err, results) => {
                  if (err) throw err;
                  console.log(
                    `Deleted ${selectedRole.job_title} successfully.`
                  );

                  // Display updated roles table
                  viewAllRoles();
                }
              );
            }
          }
        );
      });
  });
};

// delete department
const deleteDepartment = () => {
  // Query the database to get a list of all departments
  db.query("SELECT * FROM departments", (err, departmentsResult) => {

    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "list",
          name: "department_id",
          message: "Select a department to delete:",
          choices: departmentsResult.map((department) => ({
            name: department.department_name,
            value: department.department_id,
          })),
        },
      ])
      .then((answers) => {
        const selectedDepartment = departmentsResult.find(
          (department) => department.department_id === answers.department_id
        );

        // Check if there are any roles in the selected department
        db.query(
          "SELECT * FROM roles WHERE department_id = ?",
          [ selectedDepartment.department_id ],
          (err, rolesResult) => {

            if (err) throw err;

            if (rolesResult.length > 0) {
              console.log(
                "Cannot delete the department. There are roles assigned to this department. Delete roles in department to continue."
              );
              // restart app
              init();

            } else {
              // No roles in the department, proceed with deletion
              db.query(
                "DELETE FROM departments WHERE department_id = ?",
                [ selectedDepartment.department_id ],
                (err, results) => {
                  if (err) throw err;
                  console.log(
                    `Deleted Department: ${selectedDepartment.department_name} successfully.`
                  );

                  // Display updated roles table
                  viewAllDepartments();
                }
              );
            }
          }
        );
      });
  });
};

const viewBudgetByDepartment = () => {
  // Query the database to get a list of all departments
  db.query("SELECT DISTINCT department_id, department_name FROM departments", (err, departmentsResult) => {
    if (err) throw err;

    // Prompt the user to select a department
    inquirer
      .prompt([
        {
          type: "list",
          name: "selected_department",
          message: "Select the department to view utilized budget:",
          choices: departmentsResult.map((department) => ({
            name: department.department_name,
            value: department.department_id,
          })),
        },
      ])
      .then((answers) => {
        // Query the database to get budget based on the selected department
        db.query(
          `SELECT d.department_name, SUM(r.role_salary) AS utilized_budget
          FROM employees e
          JOIN roles r ON e.role_id = r.role_id
          JOIN departments d ON r.department_id = d.department_id
          WHERE d.department_id = ?`,
          [ answers.selected_department ],
          (err, budgetResult) => {

            if (err) throw err;

            // Display the list of employees in the selected department
            console.log(`Here's the utilized_budget for the ${answers.selected_department} department:`);
            console.table(budgetResult);

            // Restart the application
            init();
          }
        );
      });
  });
};
