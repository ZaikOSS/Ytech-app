CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Storing as plain text or simple hash for local dev
    role ENUM('CLIENT', 'MANAGER', 'ADMIN') NOT NULL DEFAULT 'CLIENT',
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    manager_id INT, -- Can be NULL if unassigned
    status ENUM('PENDING', 'PAID', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'PENDING',
    current_phase INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES Users(id),
    FOREIGN KEY (manager_id) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS Invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    invoice_number VARCHAR(255) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('UNPAID', 'PAID') DEFAULT 'UNPAID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Projects(id)
);

CREATE TABLE IF NOT EXISTS Transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    cardholder_name VARCHAR(255),
    card_details_string VARCHAR(255),
    zipcode VARCHAR(20),
    company_name VARCHAR(255),
    email VARCHAR(255),
    status ENUM('SUCCESS', 'FAILED') DEFAULT 'SUCCESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES Invoices(id)
);

CREATE TABLE IF NOT EXISTS Messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_text TEXT NOT NULL,
    file_url VARCHAR(255) NULL,
    file_name VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Projects(id),
    FOREIGN KEY (sender_id) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS ContactInquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('UNREAD', 'READ') DEFAULT 'UNREAD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Users
INSERT IGNORE INTO Users (username, password, role, full_name) VALUES 
('admin', 'admin123', 'ADMIN', 'System Admin'),
('sarah', 'sarah123', 'MANAGER', 'Sarah Jenkins'),
('client1', 'client123', 'CLIENT', 'John Doe');
