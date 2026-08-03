<?php
header("Access-Control-Allow-Origin: *");

$db_host = 'uk03-sql.pebblehost.com';
$db_name = 'customer_1492946_Skins';
$db_user = 'customer_1492946_Skins';
$db_pass = 'C21Hyiqm1Q.^cuc.fsyfIMI';

$player = isset($_GET['name']) ? trim($_GET['name']) : 'MHF_Steve';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

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
        } else {
            echo "JSON decoded, but no skin URL found.";
            exit;
        }
    } else {
        echo "No skin found in DB for player: " . htmlspecialchars($player);
        exit;
    }
} catch (Exception $e) {
    echo "Database Error: " . $e->getMessage();
    exit;
}
