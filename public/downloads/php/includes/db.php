<?php
/**
 * Database Connection Helper
 */

function getDb(): PDO {
    static $pdo = null;
    
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }
    
    return $pdo;
}

/**
 * Execute a query and return all rows
 */
function db(string $sql, array $params = []): array {
    $stmt = getDb()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

/**
 * Execute a query and return single row
 */
function dbOne(string $sql, array $params = []): ?array {
    $stmt = getDb()->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch();
    return $row ?: null;
}

/**
 * Execute a query (INSERT, UPDATE, DELETE) and return affected rows or last insert ID
 */
function dbExec(string $sql, array $params = []): int {
    $stmt = getDb()->prepare($sql);
    $stmt->execute($params);
    
    // Return last insert ID for INSERT statements
    if (stripos(trim($sql), 'INSERT') === 0) {
        return (int) getDb()->lastInsertId();
    }
    
    return $stmt->rowCount();
}
