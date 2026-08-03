<?php
header("Access-Control-Allow-Origin: *");

$db_host = 'uk03-sql.pebblehost.com';
$db_name = 'customer_1492946_Skins';
$db_user = 'customer_1492946_Skins';
$db_pass = 'C21Hyiqqm1Q.^cuc.fsyflMI';

$player = isset($_GET['name']) ? trim($_GET['name']) : 'MHF_Steve';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Προσαρμοσε τα ονοματα των πινακων παρακατω αν στο phpMyAdmin διαφερουν
    $stmt = $pdo->prepare("
        SELECT s.Value 
        FROM sr_players p 
        JOIN sr_skins s ON LOWER(p.Skin) = LOWER(s.Nick) 
        WHERE LOWER(p.Nick) = LOWER(?)
    ");
    $stmt->execute([$player]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row && !empty($row['Value'])) {
        $json = json_decode(base64_decode($row['Value']), true);
        if (isset($json['textures']['SKIN']['url'])) {
            $skinUrl = $json['textures']['SKIN']['url'];
            $skinHash = basename($skinUrl);

            header("Location: https://visage.surgeplay.com/face/64/" . $skinHash);
            exit;
        }
    }
} catch (Exception $e) {
    // Καταγραφή σφάλματος εσωτερικά
    error_log("Database Error: " . $e->getMessage());
}

// Fallback στο mc-heads avatar αν δεν βρεθεί το skin ή αν αποτύχει η βάση
header("Location: https://mc-heads.net/avatar/" . urlencode($player) . "/64");
exit;
