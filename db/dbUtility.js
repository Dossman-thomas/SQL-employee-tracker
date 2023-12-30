const inquirer = require('inquirer');
const constants = require('./constants');
const db = require('./db');

// UTILITY FUNCTIONS

// view all departments
const viewAllDepartments = (initCallback) => {

  db.query(
    constants.ALL_DEPARTMENTS_QUERY,
     function (err, results) {
      console.log('Here are all company departments');
      console.table(results);
    }
  );

  // restart app
  initCallback();
};

// Add a department - prompted to enter the name of the department and that department is added to the database
const addDepartment = (initCallback) => {

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
    constants.ADD_DEPARTMENT_QUERY,
    depName,
    function (err, results) {

    if (err) throw err;
      console.log(`Added ${answers.department_name} to the departments table!`);

      // display updated department table
      viewAllDepartments(initCallback);
      } 
    );
  })

};

// view all roles
const viewAllRoles = (initCallback) => {

  db.query(
    constants.ALL_ROLES_QUERY, 
    function (err, results) {
      console.log('Here are all department roles');
      console.table(results);
    }
  );

  // restart app
  initCallback();
};

// add a role - prompted to enter the name, salary, and department for the role and that role is added to the database
const addRole = (initCallback) => {

  db.query(
    constants.ALL_DEPARTMENTS_QUERY,
    (err, res) => {

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
      constants.ADD_ROLE_QUERY,
      [newRole], 
      function (err, results) {

      if (err) throw err;
        console.log(`\nAdded ${answers.role_name} to the roles table!`);

        // display updated roles table
        viewAllRoles(initCallback);
        } 
      );
    })
  });
}; 


// view all employees
const viewAllEmployees = (initCallback) => {

  db.query(
    constants.ALL_EMPLOYEES_QUERY,
    function (err, res) {
      console.log('\nHere are all employees');
      console.table(res);
    }
  );

    // restart app
    initCallback();
};

// add employee - prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
const addEmployee = (initCallback) => {
  db.query(
    constants.ALL_ROLES_QUERY, 
    (err, rolesResult) => {
    if (err) throw err;

    db.query(
      constants.VIEW_EMPLOYEES_FULL_NAME_QUERY,
      (err, managersResult) => {

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
            constants.ADD_EMPLOYEE_QUERY,
            [newEmployee],
            function (err, results) {
              if (err) throw err;
              console.log(`Added ${answers.first_name} ${answers.last_name} to the employees table!`);

              // Display updated employees table
              viewAllEmployees(initCallback);
            }
          );
        });
    });
  });
};

// update an employee role - prompted to select an employee to update and their new role and this information is updated in the database

const updateEmployeeRole = (initCallback) => {

  db.query(
    constants.ALL_EMPLOYEES_QUERY, 
    (err, employeesResult) => {
    if (err) throw err;

    db.query(
      constants.ALL_ROLES_QUERY,
      (err, rolesResult) => {
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
            constants.UPDATE_EMPLOYEE_ROLE_QUERY,
            [ selectedRole.role_id, selectedEmployee.employee_id ],
            function (err, results) {
              if (err) throw err;
              console.log(
                `Updated role for ${selectedEmployee.employee_first_name} ${selectedEmployee.employee_last_name} to ${answers.new_role}!`
              );

              // Display updated employees table
              viewAllEmployees(initCallback);
            }
          );
        });
    });
  });
};

// update employee managers
const updateEmployeeManager = (initCallback) => {

  db.query(
    constants.ALL_EMPLOYEES_QUERY, 
    (err, employeesResult) => {
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
          constants.UPDATE_EMPLOYEE_MANAGER_QUERY,
          [ selectedManager.employee_id, selectedEmployee.employee_id ],
          function (err, results) {
            if (err) throw err;
            console.log(
              `Updated manager for ${selectedEmployee.employee_first_name} ${selectedEmployee.employee_last_name} to ${answers.new_manager}!`
            );

            // Display updated employees table
            viewAllEmployees(initCallback);
          }
        );
      });
  });
};


// View employees by manager
const viewEmployeesByManager = (initCallback) => {
  // Query the database to get a list of all managers
  db.query(
    constants.VIEW_EMPLOYEES_BY_MANAGER_QUERY,
    (err, managersResult) => {
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
          constants.VIEW_EMPLOYEES_BY_SELECTED_MANAGER_QUERY,
          [ answers.selected_manager ],
          (err, employeesResult) => {
            if (err) throw err;
            // console.log(answers.selected_manager);
            // Display the list of employees under the selected manager
            console.log(`Employees under Manager ID ${answers.selected_manager}:`);
            console.table(employeesResult);

            // Restart the application
            initCallback();
          }
        );
      });
  });
};


// View employees by department
const viewEmployeesByDepartment = (initCallback) => {
  // Query the database to get a list of all departments
  db.query(
    constants.ALL_DEPARTMENTS_QUERY, 
    (err, departmentsResult) => {
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
          constants.VIEW_EMPLOYEES_BY_DEPARTMENT_QUERY,
          [ answers.selected_department ],
          (err, employeesResult) => {
            if (err) throw err;

            // Display the list of employees in the selected department
            console.log(`Employees in Department ${answers.selected_department}:`);
            console.table(employeesResult);

            // Restart the application
            initCallback();
          }
        );
      });
  });
};

// Delete employee
const deleteEmployee = (initCallback) => {

  db.query(
    constants.ALL_EMPLOYEES_QUERY, 
    (err, employeesResult) => {
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
          constants.DELETE_EMPLOYEE_QUERY,
          [ selectedEmployee.employee_id ],
          function (err, results) {
            if (err) throw err;
            console.log(
              `Deleted ${selectedEmployee.employee_first_name} ${selectedEmployee.employee_last_name} successfully.`
            );

            // Display updated employees table
            viewAllEmployees(initCallback);
          }
        );
      });
  });
};


// delete role
const deleteRole = (initCallback) => {
  // Query the database to get a list of all roles
  db.query(
    constants.ALL_ROLES_QUERY,
    (err, rolesResult) => {
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
          constants.VIEW_EMPLOYEES_BY_ROLE_QUERY,
          [selectedRole.role_id],
          (err, employeesResult) => {
            if (err) throw err;

            if (employeesResult.length > 0) {
              console.log(
                "Cannot delete the role. There are employees assigned to this role. Delete employees in this role to continue."
              );
              // restart app
              initCallback();
            } else {
              // No employees in the role, proceed with deletion
              db.query(
                constants.DELETE_ROLE_QUERY,
                [selectedRole.role_id],
                (err, results) => {
                  if (err) throw err;
                  console.log(
                    `Deleted ${selectedRole.job_title} successfully.`
                  );

                  // Display updated roles table
                  viewAllRoles(initCallback);
                }
              );
            }
          }
        );
      });
  });
};

// delete department
const deleteDepartment = (initCallback) => {
  // Query the database to get a list of all departments
  db.query(
    constants.ALL_DEPARTMENTS_QUERY,
    (err, departmentsResult) => {

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
          constants.VIEW_ROLES_BY_DEPARTMENT,
          [ selectedDepartment.department_id ],
          (err, rolesResult) => {

            if (err) throw err;

            if (rolesResult.length > 0) {
              console.log(
                "Cannot delete the department. There are roles assigned to this department. Delete roles in department to continue."
              );
              // restart app
              initCallback();

            } else {
              // No roles in the department, proceed with deletion
              db.query(
                constants.DELETE_DEPARTMENT_QUERY,
                [ selectedDepartment.department_id ],
                (err, results) => {
                  if (err) throw err;
                  console.log(
                    `Deleted Department: ${selectedDepartment.department_name} successfully.`
                  );

                  // Display updated roles table
                  viewAllDepartments(initCallback);
                }
              );
            }
          }
        );
      });
  });
};

const viewBudgetByDepartment = (initCallback) => {
  // Query the database to get a list of all departments
  db.query(
    constants.ALL_DEPARTMENTS_QUERY, 
    (err, departmentsResult) => {
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
          constants.VIEW_BUDGET_BY_DEPARTMENT_QUERY,
          [ answers.selected_department ],
          (err, budgetResult) => {

            if (err) throw err;

            // Display the list of employees in the selected department
            console.log(`Here's the utilized_budget for the ${answers.selected_department} department:`);
            console.table(budgetResult);

            // Restart the application
            initCallback();
          }
        );
      });
  });
};

module.exports = {
  viewAllDepartments,
  addDepartment,
  viewAllRoles,
  addRole,
  viewAllEmployees,
  addEmployee,
  updateEmployeeRole,
  updateEmployeeManager,
  viewEmployeesByManager,
  viewEmployeesByDepartment,
  deleteEmployee,
  deleteRole,
  deleteDepartment,
  viewBudgetByDepartment
};