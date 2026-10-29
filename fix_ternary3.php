<?php
// Fix both files completely

// 1. Fix Doctor Appointments
$file1 = 'resources/js/Pages/Doctor/Appointments.tsx';
$content1 = file_get_contents('resources/js/Pages/Doctor/Appointments.tsx');

// Replace ternary expressions in JSX
$content1 = preg_replace('/\) : null\}/', ')', $content1);
$content1 = preg_replace('/\) : \(/', ' && ', $content1);
$content1 = preg_replace('/\? : \(/', ' && ', $content1);
$content1 = preg_replace('/\) : null\}/', ')', $content1);
$content1 = str_replace(') : null}', ')', $content1);
$content1 = str_replace(') : (', ' && ', $content1);
$content1 = str_replace('? : (', ' && ', $content1);
$content1 = str_replace('? : null}', ')', $content1);

// Fix specific patterns
$content1 = preg_replace('/\) : null\}/', ')', $content1);
$content1 = str_replace(') : (', ' && ', $content1);
$content1 = str_replace(') : null}', ')', $content1);

file_put_contents('resources/js/Pages/Doctor/Appointments.tsx', $content1);
echo "Fixed Doctor Appointments\n";

// Patient Appointments
$file2 = 'resources/js/Pages/Patient/Appointments.tsx';
$content2 = file_get_contents($file2);
$content2 = str_replace(') : null}', ')', $content2);
$content2 = str_replace(') : (', ' && ', $content2);
$content2 = str_replace(') : null}', ')', $content2);
$content2 = str_replace(') : (', ' && ', $content2);
$content2 = str_replace('? : (', ' && ', $content2);
$content2 = str_replace('? : null}', ')', $content2);

file_put_contents('resources/js/Pages/Patient/Appointments.tsx', $content2);
echo "Done fixing Patient Appointments\n";