<?php

$month = date('n'); // 1 = January, 12 = December

$moisFrancais = [
    1 => 'Janvier',
    2 => 'Février',
    3 => 'Mars',
    4 => 'Avril',
    5 => 'Mai',
    6 => 'Juin',
    7 => 'Juillet',
    8 => 'Août',
    9 => 'Septembre',
    10 => 'Octobre',
    11 => 'Novembre',
    12 => 'Décembre',
];

$moisFrancaisPhrase = [
    1 => "de Janvier",
    2 => "de Février",
    3 => "de Mars",
    4 => "d'Avril",
    5 => "de Mai",
    6 => "de Juin",
    7 => "de Juillet",
    8 => "d'Août",
    9 => "de Septembre",
    10 => "d'Octobre",
    11 => "de Novembre",
    12 => "de Décembre",
];

$messages['to'] = 'HO.SBLANC@cma-cgm.com';
$messages['subject'] = 'Navigo ' . $moisFrancais[$month] . ' - Alexandre PAILLARES';
$messages['body'] = <<<TEXT
Bonjour Sophie,
Tu trouveras en pièce jointe mon attestation navigo pour le mois $moisFrancaisPhrase[$month]
Cordialement,
TEXT
;

echo $messages['to'];
echo PHP_EOL;
echo $messages['subject'];
echo PHP_EOL;
echo $messages['body'];
echo PHP_EOL;
