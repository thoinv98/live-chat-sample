<?php

include 'FirebaseJWT/JWT.php';

use \Firebase\JWT\JWT;


$apiKeySid = 'SK.0.cUg2ixyqO96iMv57o0lMHsorgw9ckq0p'; //YOUR_API_KEY_SID
$apiKeySecret = 'akZFMEV2ek1sc3FVOWFCMkxPUHdsS3d0Y1FJNmJiMA=='; //YOUR_API_KEY_SECRET

$now = time();
$exp = $now + 100000000;

$userId = @$_GET['userId'];
$roomId = @$_GET['roomId'];
$rest = @$_GET['rest'];

$header = array('cty' => 'stringee-api;v=1');

if (!$apiKeySid || !$apiKeySecret) {
    echo json_encode([
        'err' => true,
        'code' => 1
    ]);
    exit;
}

if ($userId) {
    $payload = array(
        'jti' => $apiKeySid . '-' . $now,
        'iss' => $apiKeySid,
        'exp' => $exp,
        'userId' => $userId
    );
    $clientAccessToken = JWT::encode($payload, $apiKeySecret, 'HS256', null, $header);
}

if ($rest) {
    $payload = array(
        'jti' => $apiKeySid . '-' . $now,
        'iss' => $apiKeySid,
        'exp' => $exp,
        'rest_api' => true
    );
    $restAccessToken = JWT::encode($payload, $apiKeySecret, 'HS256', null, $header);
}

if ($roomId) {
    $payload = array(
        'jti' => $apiKeySid . '-' . $now,
        'iss' => $apiKeySid,
        'exp' => $exp,
        'roomId' => $roomId,
        'permissions' => array(
            'publish' => true,
            'subscribe' => true,
            'control_room' => true,
            'record' => false
        )
    );
    $roomToken = JWT::encode($payload, $apiKeySecret, 'HS256', null, $header);
}

$res = array(
    'access_token' => @$clientAccessToken,
    'room_token' => @$roomToken,
    'rest_access_token' => @$restAccessToken,
);

header('Access-Control-Allow-Origin: *');
echo json_encode($res);





