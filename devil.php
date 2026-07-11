<?php
echo "<h1>Devil Hack Diagnostics</h1>";
echo "Current user: " . get_current_user() . "<br>";
echo "Document Root: " . \['DOCUMENT_ROOT'] . "<br>";
\ = shell_exec('which node');
echo "Node path: " . (\ ? \ : 'Not found in PATH') . "<br>";
\ = shell_exec('ls /opt/cpanel/ea-nodejs*/bin/node');
echo "cPanel Node paths: <pre>" . \ . "</pre><br>";
?>
