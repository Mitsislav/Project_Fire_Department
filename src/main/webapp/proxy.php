<?php

/* CORS Problem solve*/

header("Access-Control-Allow-Origin: *");

/* data from api are in json form */

header("Content-Type: application/json");

/* api endpoint to convert locations to geographic coordinates */
//$url="https://forward-reverse-geocoding.p.rapidapi.com/v1/forward";

$url="https://forward-reverse-geocoding.p.rapidapi.com/v1/search";

/* api info with key and host name */
$headers = [
    "x-rapidapi-key: 98c38865efmshc953a2770699764p105460jsnd61597546dca",
    "x-rapidapi-host: forward-reverse-geocoding.p.rapidapi.com"
];

/* initialization of url */
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url . '?' . http_build_query($_GET));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
