//实现浏览器下载文件
$file = 'test.jpg';
$fp=fopen($file,"r");  
$file_size=filesize($file);  
$saveFileName = 'down.jpg';  
//下载文件需要用到的头  
Header("Content-type: application/octet-stream");   
Header("Accept-Ranges: bytes");   
Header("Accept-Length:".$file_size);   
Header("Content-Disposition: attachment; filename=".$saveFileName);   
$buffer=1024;  
$file_count=0;  
//向浏览器返回数据  
while(!feof($fp) && $file_count<$file_size){  
    $file_con=fread($fp,$buffer);  
    $file_count+=$buffer;  
    echo $file_con;  
}  
fclose($fp);  
exit;