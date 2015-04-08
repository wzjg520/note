<?php

require dirname(__FILE__) . '/../../../../service/libraries/CLibUploader.php';

$uploader = new CLibUploader();
// $valid = $uploader->validate('jpg,png', 10240000);

$filename = time() . '-' . $uploader->getName();
$filepath = dirname(__FILE__) . '/tmp/' . $filename;
$url = $_GET['url'];

$uploader->save($filepath);

echo json_encode(array(
	'errno' => 0,
	'msg' => '',
	'data' => $url . '/tmp/' . $filename,
));
