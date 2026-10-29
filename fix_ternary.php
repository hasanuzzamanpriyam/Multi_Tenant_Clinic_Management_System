<?php

$file = 'resources/js/Pages/Doctor/Appointments.tsx';
$content = file_get_contents($file);

// Fix the ternary expressions in JSX
$content = preg_replace('/\) : null\}/', ')', $content);
$content = preg_replace('/\? : \(/', ' && ', $content);
$content = preg_replace('/\? : null\}/', ')', $content);
$content = preg_replace('/\) : \(/', ' && ', $content);

file_put_contents($file, $content);
echo "Done fixing Doctor Appointments\n";

$file2 = 'resources/js/Pages/Patient/Appointments.tsx';
$content2 = file_get_contents($file2);
$content2 = preg_replace('/\) : null\}/', ')', $content2);
$content2 = preg_replace('/\? : \(/', ' && ', $content2);
$content2 = preg_replace('/\) : null\}/', ')', $content2);
$content2 = preg_replace('/\) : \(/', ' && ', $content2);
file_put_contents($file2, $content2);
echo "Done fixing Patient Appointments\n";