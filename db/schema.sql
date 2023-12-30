/* create and use company_db */
DROP DATABASE IF EXISTS company_db; 
CREATE DATABASE company_db; 
USE company_db;

/* Create departments table */
CREATE TABLE departments (
  department_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
  department_name VARCHAR(100) NOT NULL
);

/* Create roles table */
CREATE TABLE roles (
  role_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  job_title VARCHAR(100) NOT NULL,
  department_id INT NOT NULL, 
  role_salary DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (department_id)
  REFERENCES departments(department_id)
);

/* Create employees table */
CREATE TABLE employees (
  employee_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employee_last_name VARCHAR(50) NOT NULL,
  employee_first_name VARCHAR(50) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT NULL,
  FOREIGN KEY (role_id)
  REFERENCES roles (role_id),
  FOREIGN KEY (manager_id)
  REFERENCES employees (employee_id)
);
