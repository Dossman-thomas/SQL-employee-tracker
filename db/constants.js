// export all queries
module.exports = {
  ALL_DEPARTMENTS_QUERY: 'SELECT * FROM departments',
  ADD_DEPARTMENT_QUERY: 'INSERT INTO departments (department_name) VALUES (?)',
  ALL_ROLES_QUERY: 'SELECT r.role_id, r.job_title, d.department_name, r.role_salary FROM roles r JOIN departments d ON r.department_id = d.department_id',
  ADD_ROLE_QUERY: 'INSERT INTO roles (job_title, role_salary, department_id) VALUES (?)',
  ALL_EMPLOYEES_QUERY: `SELECT e.employee_id, e.employee_first_name, e.employee_last_name, 
    r.job_title, d.department_name, r.role_salary, CONCAT(m.employee_first_name, ' ', m.employee_last_name) AS manager_name
    FROM employees e
    JOIN roles r ON e.role_id = r.role_id
    JOIN departments d ON r.department_id = d.department_id
    LEFT JOIN employees m ON e.manager_id = m.employee_id`,
  VIEW_EMPLOYEES_FULL_NAME_QUERY: `SELECT employee_id, CONCAT(employee_first_name, ' ', employee_last_name) AS manager_name FROM employees`,
  VIEW_EMPLOYEES_BY_SELECTED_MANAGER_QUERY: `SELECT e.employee_id, e.employee_first_name, e.employee_last_name, r.job_title, d.department_name, r.role_salary, CONCAT(m.employee_first_name, ' ', m.employee_last_name) AS manager_name
  FROM employees e
  JOIN roles r ON e.role_id = r.role_id
  JOIN departments d ON r.department_id = d.department_id
  LEFT JOIN employees m ON e.manager_id = m.employee_id
  WHERE e.manager_id = ?`, 
  ADD_EMPLOYEE_QUERY: 'INSERT INTO employees (employee_first_name, employee_last_name, role_id, manager_id) VALUES (?)',
  UPDATE_EMPLOYEE_ROLE_QUERY: 'UPDATE employees SET role_id = ? WHERE employee_id = ?',
  UPDATE_EMPLOYEE_MANAGER_QUERY: 'UPDATE employees SET manager_id = ? WHERE employee_id = ?',
  VIEW_EMPLOYEES_BY_ROLE_QUERY: 'SELECT * FROM employees WHERE role_id = ?',
  VIEW_EMPLOYEES_BY_MANAGER_QUERY: `SELECT DISTINCT manager_id, 
    (SELECT CONCAT(employee_first_name, ' ', employee_last_name) FROM employees m WHERE m.employee_id = e.manager_id) AS manager_name
    FROM employees e
    WHERE e.manager_id IS NOT NULL`,
  VIEW_EMPLOYEES_BY_DEPARTMENT_QUERY: `SELECT e.employee_id, e.employee_first_name, e.employee_last_name, r.job_title, d.department_name, r.role_salary, CONCAT(m.employee_first_name, ' ', m.employee_last_name) AS manager_name
  FROM employees e
  JOIN roles r ON e.role_id = r.role_id
  JOIN departments d ON r.department_id = d.department_id
  LEFT JOIN employees m ON e.manager_id = m.employee_id
  WHERE d.department_id = ?`,
  VIEW_ROLES_BY_DEPARTMENT: 'SELECT * FROM roles WHERE department_id = ?',
  DELETE_EMPLOYEE_QUERY: 'DELETE FROM employees WHERE employee_id = ?',
  DELETE_ROLE_QUERY: 'DELETE FROM roles WHERE role_id = ?',
  DELETE_DEPARTMENT_QUERY: 'DELETE FROM departments WHERE department_id = ?',
  VIEW_BUDGET_BY_DEPARTMENT_QUERY: `SELECT d.department_name, SUM(r.role_salary) AS utilized_budget
    FROM employees e
    JOIN roles r ON e.role_id = r.role_id
    JOIN departments d ON r.department_id = d.department_id
    WHERE d.department_id = ?`,
};
