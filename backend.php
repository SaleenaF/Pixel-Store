<?php
session_start();
header('Content-Type: application/json');

// Initialize session data if not exists
if (!isset($_SESSION['users'])) {
    $_SESSION['users'] = [];
    $_SESSION['products'] = [
        'shirts' => [
            ['id' => 1, 'name' => "Pixel T-Shirt", 'price' => 19.99, 'image' => "images/products/1.jpg"],
            ['id' => 2, 'name' => "Retro Shirt", 'price' => 24.99, 'image' => "images/products/2.jpg"],
            ['id' => 3, 'name' => "Gamer Shirt", 'price' => 22.99, 'image' => "images/products/3.jpg"],
            ['id' => 4, 'name' => "Code Shirt", 'price' => 21.99, 'image' => "images/products/4.jpg"],
            ['id' => 5, 'name' => "Art Shirt", 'price' => 23.99, 'image' => "images/products/5.jpg"]
        ],
        'pants' => [
            ['id' => 6, 'name' => "Classic Jeans", 'price' => 29.99, 'image' => "images/products/6.jpg"],
            ['id' => 7, 'name' => "Cargo Pants", 'price' => 34.99, 'image' => "images/products/7.jpg"],
            ['id' => 8, 'name' => "Chinos", 'price' => 27.99, 'image' => "images/products/8.jpg"],
            ['id' => 9, 'name' => "Joggers", 'price' => 25.99, 'image' => "images/products/9.jpg"],
            ['id' => 10, 'name' => "Slacks", 'price' => 31.99, 'image' => "images/products/10.jpg"]
        ],
        'dresses' => [
            ['id' => 11, 'name' => "Summer Dress", 'price' => 34.99, 'image' => "images/products/11.jpg"],
            ['id' => 12, 'name' => "Floral Dress", 'price' => 39.99, 'image' => "images/products/12.jpg"],
            ['id' => 13, 'name' => "Party Dress", 'price' => 44.99, 'image' => "images/products/13.jpg"],
            ['id' => 14, 'name' => "Casual Dress", 'price' => 29.99, 'image' => "images/products/14.jpg"],
            ['id' => 15, 'name' => "Formal Dress", 'price' => 49.99, 'image' => "images/products/15.jpg"]
        ],
        'other' => [
            ['id' => 16, 'name' => "Gamer Hoodie", 'price' => 39.99, 'image' => "images/products/16.jpg"],
            ['id' => 17, 'name' => "Denim Jacket", 'price' => 45.99, 'image' => "images/products/17.jpg"],
            ['id' => 18, 'name' => "Winter Coat", 'price' => 59.99, 'image' => "images/products/18.jpg"],
            ['id' => 19, 'name' => "Rain Jacket", 'price' => 42.99, 'image' => "images/products/19.jpg"],
            ['id' => 20, 'name' => "Varsity Jacket", 'price' => 49.99, 'image' => "images/products/20.jpg"]
        ]
    ];
    $_SESSION['carts'] = [];
}

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'register':
        $user = [
            'id' => time(),
            'firstName' => $_POST['firstName'] ?? '',
            'lastName' => $_POST['lastName'] ?? '',
            'email' => $_POST['email'] ?? '',
            'address' => $_POST['address'] ?? '',
            'phone' => $_POST['phone'] ?? '',
            'password' => password_hash($_POST['password'] ?? '', PASSWORD_DEFAULT),
            'purchases' => []
        ];
        
        // Validate
        if (empty($user['firstName']) || empty($user['lastName']) || empty($user['email']) || empty($_POST['password'])) {
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit;
        }
        
        // Check if email exists
        foreach ($_SESSION['users'] as $existingUser) {
            if ($existingUser['email'] === $user['email']) {
                echo json_encode(['success' => false, 'message' => 'Email already registered']);
                exit;
            }
        }
        
        $_SESSION['users'][] = $user;
        $_SESSION['current_user'] = [
            'id' => $user['id'],
            'firstName' => $user['firstName'],
            'email' => $user['email']
        ];
        
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful',
            'user' => $_SESSION['current_user'],
            'cartCount' => 0
        ]);
        break;
        
    case 'login':
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        
        foreach ($_SESSION['users'] as $user) {
            if ($user['email'] === $email && password_verify($password, $user['password'])) {
                $_SESSION['current_user'] = [
                    'id' => $user['id'],
                    'firstName' => $user['firstName'],
                    'email' => $user['email']
                ];
                
                $userId = $user['id'];
                $cartCount = isset($_SESSION['carts'][$userId]) ? array_sum($_SESSION['carts'][$userId]) : 0;
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => $_SESSION['current_user'],
                    'cartCount' => $cartCount
                ]);
                exit;
            }
        }
        
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        break;
        
    case 'logout':
        unset($_SESSION['current_user']);
        echo json_encode(['success' => true, 'message' => 'Logged out']);
        break;
        
    case 'check_login':
        if (isset($_SESSION['current_user'])) {
            $userId = $_SESSION['current_user']['id'];
            $cartCount = isset($_SESSION['carts'][$userId]) ? array_sum($_SESSION['carts'][$userId]) : 0;
            
            echo json_encode([
                'success' => true,
                'user' => $_SESSION['current_user'],
                'cartCount' => $cartCount
            ]);
        } else {
            echo json_encode(['success' => false]);
        }
        break;
        
    case 'add_to_cart':
        if (!isset($_SESSION['current_user'])) {
            echo json_encode(['success' => false, 'message' => 'Please login to add items to cart', 'requiresLogin' => true]);
            exit;
        }
        
        $productId = (int)($_POST['productId'] ?? 0);
        $userId = $_SESSION['current_user']['id'];
        
        if (!isset($_SESSION['carts'][$userId])) {
            $_SESSION['carts'][$userId] = [];
        }
        
        if (!isset($_SESSION['carts'][$userId][$productId])) {
            $_SESSION['carts'][$userId][$productId] = 0;
        }
        
        $_SESSION['carts'][$userId][$productId]++;
        
        echo json_encode([
            'success' => true,
            'message' => 'Item added to cart',
            'cartCount' => array_sum($_SESSION['carts'][$userId])
        ]);
        break;
        
    case 'remove_from_cart':
        if (!isset($_SESSION['current_user'])) {
            echo json_encode(['success' => false, 'message' => 'Please login to modify cart']);
            exit;
        }
        
        $productId = (int)($_POST['productId'] ?? 0);
        $userId = $_SESSION['current_user']['id'];
        
        if (isset($_SESSION['carts'][$userId][$productId])) {
            unset($_SESSION['carts'][$userId][$productId]);
            
            echo json_encode([
                'success' => true,
                'cartCount' => array_sum($_SESSION['carts'][$userId] ?? [])
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Item not found in cart']);
        }
        break;
        
    case 'get_cart':
        if (!isset($_SESSION['current_user'])) {
            echo json_encode(['success' => false, 'message' => 'Please login to view cart', 'requiresLogin' => true]);
            exit;
        }
        
        $userId = $_SESSION['current_user']['id'];
        $cartItems = [];
        
        if (isset($_SESSION['carts'][$userId])) {
            foreach ($_SESSION['carts'][$userId] as $productId => $quantity) {
                if ($quantity > 0) {
                    // Find the product in any category
                    $found = false;
                    foreach ($_SESSION['products'] as $category => $categoryProducts) {
                        foreach ($categoryProducts as $product) {
                            if ($product['id'] == $productId) {
                                $cartItems[] = [
                                    'id' => $productId,
                                    'name' => $product['name'],
                                    'price' => $product['price'],
                                    'quantity' => $quantity,
                                    'image' => $product['image']
                                ];
                                $found = true;
                                break 2;
                            }
                        }
                    }
                }
            }
        }
        
        echo json_encode([
            'success' => true,
            'cartItems' => $cartItems
        ]);
        break;
        
    case 'checkout':
        if (!isset($_SESSION['current_user'])) {
            echo json_encode(['success' => false, 'message' => 'Please login to checkout', 'requiresLogin' => true]);
            exit;
        }
        
        $userId = $_SESSION['current_user']['id'];
        $cart = $_SESSION['carts'][$userId] ?? [];
        
        if (empty($cart)) {
            echo json_encode(['success' => false, 'message' => 'Your cart is empty']);
            exit;
        }
        
        // Find user
        foreach ($_SESSION['users'] as &$user) {
            if ($user['id'] == $userId) {
                // Create order
                $order = [
                    'id' => time(),
                    'date' => date('Y-m-d H:i:s'),
                    'items' => [],
                    'subtotal' => 0,
                    'status' => 'Processing'
                ];
                
                // Calculate order details
                foreach ($_SESSION['products'] as $category => $categoryProducts) {
                    foreach ($categoryProducts as $product) {
                        if (isset($cart[$product['id']])) {
                            $order['items'][] = [
                                'productId' => $product['id'],
                                'name' => $product['name'],
                                'price' => $product['price'],
                                'quantity' => $cart[$product['id']]
                            ];
                            $order['subtotal'] += $product['price'] * $cart[$product['id']];
                        }
                    }
                }
                
                $order['tax'] = $order['subtotal'] * 0.13;
                $order['total'] = $order['subtotal'] + $order['tax'];
                
                $user['purchases'][] = $order;
                $_SESSION['carts'][$userId] = []; // Clear cart
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Order placed successfully',
                    'order' => [
                        'id' => $order['id'],
                        'total' => $order['total']
                    ]
                ]);
                exit;
            }
        }
        
        echo json_encode(['success' => false, 'message' => 'User not found']);
        break;
    
    case 'get_products':
        $category = $_POST['category'] ?? '';
        if (isset($_SESSION['products'][$category])) {
            echo json_encode([
                'success' => true,
                'products' => $_SESSION['products'][$category]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Category not found'
            ]);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
?>