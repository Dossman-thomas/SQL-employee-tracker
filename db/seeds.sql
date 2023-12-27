-- Insert data into the 'departments' table
INSERT INTO departments (department_name) VALUES
('Sales'),
('Marketing'),
('Finance'),
('IT');

-- Insert data into the 'roles' table
INSERT INTO roles (job_title, department_id, role_salary) VALUES
('Sales Manager', 1, 80000.00),
('Sales Representative', 1, 50000.00),
('Marketing Manager', 2, 75000.00),
('Marketing Coordinator', 2, 45000.00),
('Finance Manager', 3, 85000.00),
('Financial Analyst', 3, 60000.00),
('IT Manager', 4, 90000.00),
('Software Developer', 4, 70000.00);

-- Insert data into the 'employees' table
INSERT INTO employees (employee_last_name, employee_first_name, role_id, manager_id) VALUES
('Smith', 'John', 1, NULL),
('Johnson', 'Jane', 2, 1),
('Williams', 'Robert', 3, 1),
('Jones', 'Emily', 4, 2),
('Brown', 'Michael', 5, 3),
('Davis', 'Laura', 6, 3),
('Miller', 'David', 7, 4),
('Wilson', 'Olivia', 8, 4);
