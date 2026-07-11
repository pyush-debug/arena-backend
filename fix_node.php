<?php
echo "<h1>Devil Hack: Fixing Node.js Version</h1>";
\ = [22, 20, 18, 16];
\ = '';
foreach (\ as \) {
    \ = "/opt/cpanel/ea-nodejs\/bin/node";
    if (file_exists(\)) {
        \ = \;
        echo "Found modern Node.js: \ <br>";
        break;
    }
}

if (\) {
    \ = __DIR__ . '/.htaccess';
    \ = "";
    if (file_exists(\)) {
        \ = file_get_contents(\);
    }
    
    // Remove old PassengerNodejs directives
    \ = preg_replace('/PassengerNodejs .*/', '', \);
    
    // Add the correct one
    \ .= "\nPassengerNodejs \\n";
    
    file_put_contents(\, trim(\));
    echo "<h3>Success! The .htaccess file has been updated to use the modern Node.js engine.</h3>";
    echo "<p>Please refresh your API link now!</p>";
} else {
    echo "<h3>Error: Could not find any modern Node.js version on this server.</h3>";
}
?>
