//检测是否移动端
function check_wap(){
	if(stristr($_SERVER['HTTP_VIA'], 'wap')){
		return true;
	}elseif(strpos(strtoupper($_SERVER['HTTP_ACCEPT']),"VND.WAP.WML") > 0){
		return true;
	}elseif(preg_match('/ipad/i', $_SERVER['HTTP_USER_AGENT'])){
		return false;
	}elseif(preg_match('/(blackberry|configuration\/cldc|hp |hp-|htc |htc_|htc-|iemobile|kindle|midp|mmp|motorola|mobile|nokia|opera mini|opera |Googlebot-Mobile|YahooSeeker\/M1A1-R2D2|android|iphone|ipod|mobi|palm|palmos|pocket|portalmmm|ppc;|smartphone|sonyericsson|sqh|spv|symbian|treo|up.browser|up.link|vodafone|windows ce|xda |xda_)/i', $_SERVER['HTTP_USER_AGENT']))
	{
		return true;
	}
	return false;
}

function timeFormat($time)
{
	$server_time = time();
	$time_diff = $server_time - $time;
	$time_format = '';
	if($time_diff < 60)
	{
		$time_format = '刚刚';
	}
	else if($time_diff < 3600)
	{
		$time_format = (int)($time_diff / 60) . '分钟前';
	}
	else if($time_diff < 3600 * 24)
	{
		$time_format = (int)($time_diff / 3600) . '小时前';
	}
	else if(date('Y', $time) == date('Y', $server_time) && date('n', $time) == date('n', $server_time) && (int)date('j', $time) + 1 == (int)date('j', $server_time))
	{
		$time_format = '昨天';
	}
	else if(date('Y', $time) == date('Y', $server_time))
	{
		$time_format = date('m-d', $time);
	}
	else
	{
		$time_format = date('Y-m-d', $time);
	}
	return $time_format;
}