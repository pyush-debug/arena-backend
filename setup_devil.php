<?php
echo "<h1>Ultimate Passenger Bypass</h1>";

// Find Node.js
\ = [22, 20, 18, 16, 14];
\ = '';
foreach (\ as \) {
    \ = "/opt/cpanel/ea-nodejs\/bin/node";
    if (file_exists(\)) {
        \ = \;
        break;
    }
}

if (!\) {
    \ = trim(shell_exec('which node'));
}

if (!\) {
    die("Could not find Node.js on this server!");
}

echo "Found Node.js at: \ <br>";

\ = dirname(dirname(__FILE__)) . '/api_backend';
echo "App Root: \ <br>";

\ = "PassengerEnabled on\n";
\ .= "PassengerAppRoot \\n";
\ .= "PassengerAppType node\n";
\ .= "PassengerStartupFile app.js\n";
\ .= "PassengerNodejs \\n";
\ .= "PassengerBaseURI /api\n";

\ = __DIR__ . '/.htaccess';
file_put_contents(\, \);

echo "<h3>Success! Wrote .htaccess directly to Apache.</h3>";
echo "<pre>\</pre>";
?>
