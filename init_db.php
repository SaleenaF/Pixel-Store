<?php
$db = new mysqli('localhost', 'root', '', 'pixel_shop');

if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

// Insert products
$products = [
    // Shirts
    ['Pixel T-Shirt', 19.99, 'shirts', 'images/products/1.jpg'],
    ['Retro Shirt', 24.99, 'shirts', 'images/products/2.jpg'],
    ['Gamer Shirt', 22.99, 'shirts', 'images/products/3.jpg'],
    ['Code Shirt', 21.99, 'shirts', 'images/products/4.jpg'],
    ['Art Shirt', 23.99, 'shirts', 'images/products/5.jpg'],
    
    // Pants
    ['Classic Jeans', 29.99, 'pants', 'images/products/6.jpg'],
    ['Cargo Pants', 34.99, 'pants', 'images/products/7.jpg'],
    ['Chinos', 27.99, 'pants', 'images/products/8.jpg'],
    ['Joggers', 25.99, 'pants', 'images/products/9.jpg'],
    ['Slacks', 31.99, 'pants', 'images/products/10.jpg'],
    
    // Dresses
    ['Summer Dress', 34.99, 'dresses', 'images/products/11.jpg'],
    ['Floral Dress', 39.99, 'dresses', 'images/products/12.jpg'],
    ['Party Dress', 44.99, 'dresses', 'images/products/13.jpg'],
    ['Casual Dress', 29.99, 'dresses', 'images/products/14.jpg'],
    ['Formal Dress', 49.99, 'dresses', 'images/products/15.jpg'],
    
    // Other
    ['Gamer Hoodie', 39.99, 'other', 'images/products/16.jpg'],
    ['Denim Jacket', 45.99, 'other', 'images/products/17.jpg'],
    ['Winter Coat', 59.99, 'other', 'images/products/18.jpg'],
    ['Rain Jacket', 42.99, 'other', 'images/products/19.jpg'],
    ['Varsity Jacket', 49.99, 'other', 'images/products/20.jpg']
];

$stmt = $db->prepare("INSERT INTO products (name, price, category, image_path) VALUES (?, ?, ?, ?)");

foreach ($products as $product) {
    $stmt->bind_param("sdss", $product[0], $product[1], $product[2], $product[3]);
    $stmt->execute();
}

echo "Database populated successfully!";