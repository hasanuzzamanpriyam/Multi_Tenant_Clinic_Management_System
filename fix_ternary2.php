<?php
// Fix Doctor Appointments
$file = 'resources/js/Pages/Doctor/Appointments.tsx';
$content = file_get_contents($file);

// Remove all ternary expressions in JSX and replace with logical AND
$content = str_replace(') : null}', ')', $content);
$content = str_replace(') : (', ' && ', $content);
$content = str_replace(') : null}', ')', $content);
$content = str_replace(') : (', ' && ', $content);

// Also fix the specific patterns
$content = str_replace(') : null}', ')', $content);

file_put_contents('resources/js/Pages/Doctor/Appointments.tsx', $content);
echo "Fixed Doctor Appointments\n";

// Fix Patient Appointments
$file2 = 'resources/js/Pages/Patient/Appointments.tsx';
$content2 = file_get_contents($file2);
$content2 = str_replace(') : null}', ')', $content2);
$content2 = str_replace(') : (', ' && ', $content2);
$content2 = str_replace(') : null}', ')', $content2);
$content2 = str_replace(') : (', ' && ', $content2);

file_put_contents('resources/js/Pages/Patient/Appointments.tsx', $content2);
echo "Done fixing Patient Appointments\n";