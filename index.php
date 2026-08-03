<?php
header("Access-Control-Allow-Origin: *");

$db_host = 'uk03-sql.pebblehost.com';
$db_name = 'customer_1492946_Skins';
$db_user = 'customer_1492946_Skins';
$db_pass = 'C21Hyiqqm1Q.^cuc.fsyflMI';

// Αν δεν δοθεί όνομα, βάλε default Steve
$player = isset($_GET['name']) && !empty(trim($_GET['name'])) ? trim($_GET['name']) : 'MHF_Steve';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Διόρθωση: Σύνδεση με το sr_player_skins αντί για sr_skins
    $stmt = $pdo->prepare("
        SELECT ps.Value 
        FROM sr_players p 
        JOIN sr_player_skins ps ON LOWER(p.Skin) = LOWER(ps.Nick) 
        WHERE LOWER(p.Nick) = LOWER(?)
    ");
    $stmt->execute([$player]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row && !empty($row['Value'])) {
        $json = json_decode(base64_decode($row['Value']), true);
        if (isset($json['textures']['SKIN']['url'])) {
            $skinUrl = $json['textures']['SKIN']['url'];
            $skinHash = basename($skinUrl);

            // Επιστροφή custom skin από το Visage
            header("Location: https://visage.surgeplay.com/face/64/" . $skinHash);
            exit;
        }
    }
} catch (Exception $e) {
    // Καταγραφή σφάλματος στα logs του Render χωρίς να κολλάει η σελίδα
    error_log("Database Error: " . $e->getMessage());
}

// Fallback: Επιστροφή avatar με βάση το όνομα του παίκτη αν δεν υπάρχει ακόμα στη βάση
header("Location: https://mc-heads.net/avatar/" . urlencode($player) . "/64");
exit;
