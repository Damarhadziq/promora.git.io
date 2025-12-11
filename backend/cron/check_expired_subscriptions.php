<?php
/**
 * Cron job untuk mengecek subscription yang expired
 * Jalankan setiap hari dengan cron: 0 0 * * * php /path/to/check_expired_subscriptions.php
 */

require_once '../../config/db.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Find expired subscriptions
    $query = "SELECT s.id, s.store_id 
              FROM subscriptions s
              WHERE s.status = 'verified' 
              AND s.expires_at < NOW()";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $expired_subscriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($expired_subscriptions as $subscription) {
        // Begin transaction
        $db->beginTransaction();
        
        // Update subscription status
        $query = "UPDATE subscriptions SET status = 'expired' WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $subscription['id']);
        $stmt->execute();
        
        // Reset store to basic tier
        $query = "UPDATE stores 
                  SET package_tier = 'basic', 
                      package_expires_at = NULL 
                  WHERE id = :store_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':store_id', $subscription['store_id']);
        $stmt->execute();
        
        $db->commit();
        
        echo "Expired subscription ID: {$subscription['id']}\n";
    }
    
    echo "Total expired subscriptions processed: " . count($expired_subscriptions) . "\n";
    
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo "Error: " . $e->getMessage() . "\n";
}
?>